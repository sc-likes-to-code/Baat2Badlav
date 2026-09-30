import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '../types/citizen';

export const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
  bn: 'bn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

export interface VoiceRecorderState {
  isSupported: boolean;
  isSpeechRecognitionSupported: boolean;
  isRequestingPermission: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  audioBlob: Blob | null;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  errorCode: string | null;
}

export interface UseVoiceRecorderOptions {
  language: LanguageCode;
  onTranscriptChange?: (transcript: string) => void;
  maxDurationSeconds?: number;
}

export function useSpeechRecognition({
  language,
  onTranscriptChange,
  maxDurationSeconds = 60,
}: UseVoiceRecorderOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(true);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const baseTextRef = useRef<string>('');
  const finalTranscriptAccumulatorRef = useRef<string>('');
  const isExplicitStopRef = useRef<boolean>(false);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasGetUserMedia = !!(
        navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
      );
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      setIsSupported(hasGetUserMedia || !!SpeechRecognition);
      setIsSpeechRecognitionSupported(!!SpeechRecognition);
    }
  }, []);

  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('[Voice] Error releasing audio tracks:', err);
      }
      mediaStreamRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log('[Voice] Stop recording triggered');
    isExplicitStopRef.current = true;
    stopTimer();

    if (startTimeRef.current > 0) {
      const elapsed = Math.max(1, Math.min(maxDurationSeconds, Math.round((Date.now() - startTimeRef.current) / 1000)));
      setSeconds(elapsed);
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('[Voice] MediaRecorder stopped');
      } catch (err) {
        console.warn('[Voice] MediaRecorder stop error:', err);
      }
    }

    // Stop SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('[Voice] SpeechRecognition stopped');
      } catch {
        // ignore if already stopped
      }
    }

    // Release microphone tracks so the browser mic indicator turns off
    releaseMediaStream();

    setIsRecording(false);
    setIsRequestingPermission(false);
    setInterimTranscript('');
  }, [maxDurationSeconds, releaseMediaStream, stopTimer]);

  const startRecording = useCallback(
    async (currentExistingText: string = '', langOverride?: LanguageCode) => {
      console.log('[Voice] Start recording requested');
      setError(null);
      setErrorCode(null);
      isExplicitStopRef.current = false;
      baseTextRef.current = currentExistingText ? currentExistingText.trim() : '';
      finalTranscriptAccumulatorRef.current = '';

      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setIsSupported(false);
        setError('Audio recording is not supported in this browser environment.');
        setErrorCode('NOT_SUPPORTED');
        return;
      }

      setIsRequestingPermission(true);

      let stream: MediaStream;
      try {
        console.log('[Voice] Requesting microphone access via getUserMedia...');
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        console.log('[Voice] Microphone permission granted!');
        mediaStreamRef.current = stream;
      } catch (err: any) {
        console.error('[Voice] Microphone permission error:', err);
        setIsRequestingPermission(false);
        setIsRecording(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError(
            'Microphone access was denied. Please allow microphone permissions in your browser address bar to use voice input.'
          );
          setErrorCode('NOT_ALLOWED');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone was detected on your device. Please connect a microphone or type below.');
          setErrorCode('NO_DEVICE');
        } else {
          setError(`Microphone access error: ${err.message || 'Unable to open audio input.'}`);
          setErrorCode('MEDIA_ERROR');
        }
        return;
      }

      setIsRequestingPermission(false);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setSeconds(0);
      setAudioBlob(null);
      audioChunksRef.current = [];
      setInterimTranscript('');

      // 1. Initialize & start MediaRecorder for local in-memory audio capture
      try {
        const mimeTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4',
          '',
        ];
        let chosenMime = '';
        for (const mime of mimeTypes) {
          if (!mime || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime))) {
            chosenMime = mime;
            break;
          }
        }

        const options = chosenMime ? { mimeType: chosenMime } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          console.log('[Voice] Assembling in-memory audio Blob...');
          const finalMime = mediaRecorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: finalMime });
          setAudioBlob(blob);
          console.log('[Voice] Audio Blob created, size:', blob.size, 'bytes');
        };

        mediaRecorder.start(250);
        console.log('[Voice] MediaRecorder started successfully with format:', chosenMime || 'default');
      } catch (mrErr: any) {
        console.warn('[Voice] MediaRecorder initialization warning:', mrErr);
      }

      // 2. Initialize & start SpeechRecognition for live transcription (if supported)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch {
              // ignore
            }
          }

          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;

          const activeLang = langOverride || language;
          recognition.lang = LANGUAGE_LOCALE_MAP[activeLang] || 'en-IN';
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            let currentInterim = '';
            let newlyFinalized = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const resultItem = event.results[i];
              const transcriptChunk = resultItem[0]?.transcript || '';
              if (resultItem.isFinal) {
                newlyFinalized += (newlyFinalized ? ' ' : '') + transcriptChunk.trim();
              } else {
                currentInterim += (currentInterim ? ' ' : '') + transcriptChunk;
              }
            }

            if (newlyFinalized) {
              if (finalTranscriptAccumulatorRef.current) {
                finalTranscriptAccumulatorRef.current += ' ' + newlyFinalized;
              } else {
                finalTranscriptAccumulatorRef.current = newlyFinalized;
              }
            }

            setInterimTranscript(currentInterim);

            const fullSpoken = [finalTranscriptAccumulatorRef.current, currentInterim]
              .filter(Boolean)
              .join(' ')
              .trim();

            const combinedTotal = baseTextRef.current
              ? `${baseTextRef.current} ${fullSpoken}`.trim()
              : fullSpoken;

            setTranscript(combinedTotal);

            if (onTranscriptChange && fullSpoken) {
              onTranscriptChange(combinedTotal);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('[Voice] SpeechRecognition error:', event.error);
            // If speech recognition has a non-fatal service error (e.g. offline/network),
            // media recording still continues cleanly.
            if (event.error === 'network') {
              console.warn('[Voice] Speech recognition network unreachable. Audio recording continues.');
            }
          };

          recognition.onend = () => {
            console.log('[Voice] SpeechRecognition session ended.');
          };

          recognition.start();
          console.log('[Voice] SpeechRecognition started with language:', recognition.lang);
        } catch (srErr: any) {
          console.warn('[Voice] SpeechRecognition start warning:', srErr);
        }
      }

      // 3. Start timer
      stopTimer();
      timerRef.current = setInterval(() => {
        if (startTimeRef.current > 0) {
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          if (elapsed >= maxDurationSeconds) {
            setSeconds(maxDurationSeconds);
            stopRecording();
          } else {
            setSeconds(elapsed);
          }
        }
      }, 250);
    },
    [language, maxDurationSeconds, onTranscriptChange, stopRecording, stopTimer]
  );

  const resetRecording = useCallback(() => {
    stopRecording();
    setSeconds(0);
    setAudioBlob(null);
    audioChunksRef.current = [];
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setErrorCode(null);
    finalTranscriptAccumulatorRef.current = '';
    baseTextRef.current = '';
  }, [stopRecording]);

  // Clean up all streams, timers, and recognition instances on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      releaseMediaStream();
    };
  }, [releaseMediaStream, stopTimer]);

  return {
    isSupported,
    isSpeechRecognitionSupported,
    isRequestingPermission,
    isRecording,
    recordingSeconds,
    audioBlob,
    transcript,
    interimTranscript,
    error,
    errorCode,
    startRecording,
    stopRecording,
    resetRecording,
    clearError: () => setError(null),
  };
}
