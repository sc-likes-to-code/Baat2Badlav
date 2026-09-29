import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CitizenSubmission, CitizenAIInterpretation, InterpretApiResponse } from '../types/citizen';

interface AIInterpretationPageProps {
  onNavigate: (path: string) => void;
  submission: CitizenSubmission | null;
  interpretation?: CitizenAIInterpretation | null;
  onSaveInterpretation?: (interpretation: CitizenAIInterpretation) => void;
  onEditSubmission?: () => void;
  onNewSubmission?: () => void;
}

function getLanguageDisplayName(code: string): string {
  switch (code) {
    case 'bn':
      return 'Bengali (বাংলা)';
    case 'hi':
      return 'Hindi (हिन्दी)';
    case 'en':
    default:
      return 'English';
  }
}

export const AIInterpretationPage: React.FC<AIInterpretationPageProps> = ({
  onNavigate,
  submission,
  interpretation: initialInterpretation,
  onSaveInterpretation,
  onEditSubmission,
  onNewSubmission,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [interpretation, setInterpretation] = useState<CitizenAIInterpretation | null>(
    initialInterpretation || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialInterpretation && !!submission);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Deterministic guard: Tracks submission IDs for which a request has been dispatched
  // This completely prevents duplicate requests across React lifecycle, transitions, or StrictMode
  const dispatchedSubmissionsRef = useRef<Set<string>>(new Set());

  // Sync interpretation prop if changed externally
  useEffect(() => {
    if (initialInterpretation) {
      setInterpretation(initialInterpretation);
      setIsLoading(false);
      setError(null);
    }
  }, [initialInterpretation]);

  // Fetch AI interpretation from server-side /api/interpret endpoint
  const fetchInterpretation = useCallback(
    async (sub: CitizenSubmission) => {
      setIsLoading(true);
      setError(null);
      setErrorCode(null);

      // 40-second client-side timeout: ensures bounded hierarchy (SDK 30s < Server 35s < Browser 40s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      try {
        console.log('[AIInterpretationPage] Dispatching POST /api/interpret for submission:', sub.id);
        const response = await fetch('/api/interpret', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submission: sub }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: InterpretApiResponse = await response.json();
        console.log('[AIInterpretationPage] Received response:', data.success ? 'SUCCESS' : data.error);

        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.error || `Server responded with status ${response.status}`);
        }

        setInterpretation(data.data);
        if (onSaveInterpretation) {
          onSaveInterpretation(data.data);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('[AIInterpretationPage] Error interpreting submission:', err);
        if (err.name === 'AbortError') {
          setError('Interpretation request timed out. Please check your connection and click Try Again.');
        } else {
          setError(err?.message || 'An unexpected error occurred while processing AI interpretation.');
          if (err?.message?.includes('GEMINI_API_KEY') || err?.message?.includes('API key')) {
            setErrorCode('MISSING_API_KEY');
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onSaveInterpretation]
  );

  // Deterministic automatic trigger: fires exactly once per unique submission ID
  useEffect(() => {
    if (!submission) return;

    // If an interpretation already exists, or this submission ID was already dispatched, skip
    if (initialInterpretation || interpretation) return;
    if (dispatchedSubmissionsRef.current.has(submission.id)) {
      return;
    }

    // Register submission ID and dispatch exactly once
    dispatchedSubmissionsRef.current.add(submission.id);
    fetchInterpretation(submission);
  }, [submission?.id, initialInterpretation, interpretation, fetchInterpretation]);

  // Handle direct navigation when no submission is present
  if (!submission) {
    return (
      <main className="w-full bg-[#f9f9fc] py-20 text-[#1a1c1e] min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#E06D28] mx-auto mb-5 shadow-xs">
            <span className="material-symbols-outlined text-3xl">record_voice_over</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111315] mb-2">
            No citizen submission is available
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed mb-8">
            You have not submitted a community need in this session yet. Share what your community is experiencing to see how Baat2Badlav translates citizen voice into structured development signals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/citizen')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111315] hover:bg-stone-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-sm cursor-pointer"
            >
              <span>Share a Need</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-sm font-semibold px-6 py-3 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <span>Explore Intelligence</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // CITIZEN-SELECTED DATA (Real User Input)
  const userText = submission.text;
  const userLanguage = getLanguageDisplayName(submission.language);
  const userCategory = submission.category;
  const userLocationString = `${submission.location.districtName}, ${submission.location.stateName}${
    submission.location.locality ? ` · ${submission.location.locality}` : ''
  }`;
  const userGeoAnchor = `${submission.location.districtName}, ${submission.location.stateName}`;
  const isVoiceInput = submission.inputMode === 'voice';
  const durationSec = submission.recordingDurationSeconds || 7;

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleBackToEdit = () => {
    if (onEditSubmission) {
      onEditSubmission();
    } else {
      onNavigate('/citizen');
    }
  };

  const handleStartNew = () => {
    if (onNewSubmission) {
      onNewSubmission();
    } else {
      onNavigate('/citizen');
    }
  };

  const handleRetry = () => {
    if (submission) {
      // Allow explicit re-dispatch for this submission
      dispatchedSubmissionsRef.current.delete(submission.id);
      setError(null);
      setErrorCode(null);
      dispatchedSubmissionsRef.current.add(submission.id);
      fetchInterpretation(submission);
    }
  };

  return (
    <main className="w-full bg-[#f9f9fc] py-8 text-[#1a1c1e]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10">
        
        {/* Top Journey Pipeline Indicator */}
        <div className="w-full flex flex-col items-center">
          <nav aria-label="Processing Pipeline Stages" className="w-full max-w-4xl bg-white shadow-xs rounded-full px-4 py-2.5 flex items-center justify-between overflow-x-auto border border-stone-200">
            {/* 01 Listen (Completed) */}
            <button
              onClick={handleBackToEdit}
              className="flex items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
            >
              <span className="w-6 h-6 rounded-full bg-[#9cf2e8] text-[#004f49] flex items-center justify-center text-[10px] font-mono font-bold">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </span>
              <span className="text-[11px] font-mono font-semibold text-[#004f49]">01 LISTEN</span>
            </button>
            <div className="w-8 sm:w-16 h-0.5 bg-[#004f49]/40 shrink-0"></div>

            {/* 02 Understand (Active) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-[#033aaf] text-white flex items-center justify-center text-[10px] font-mono font-bold shadow-md">
                  02
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#fe843e] animate-ping"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-[#033aaf] tracking-wide">02 UNDERSTAND</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#dce1ff] text-[#033aaf] text-[10px] font-mono font-bold hidden sm:inline-block">
                {isLoading ? 'Interpreting...' : 'Active Interpretation'}
              </span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-stone-200 shrink-0"></div>

            {/* 03 Cluster (Upcoming) */}
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-2 shrink-0 opacity-60 hover:opacity-100 transition cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-mono">
                03
              </span>
              <span className="text-[11px] font-mono text-stone-600">03 CLUSTER</span>
            </button>
            <div className="w-8 sm:w-16 h-0.5 bg-stone-200 shrink-0"></div>

            {/* 04 Identify Gap */}
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-2 shrink-0 opacity-60 hover:opacity-100 transition cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-mono">
                04
              </span>
              <span className="text-[11px] font-mono text-stone-600">04 IDENTIFY GAP</span>
            </button>
            <div className="w-8 sm:w-16 h-0.5 bg-stone-200 shrink-0"></div>

            {/* 05 Explore Impact */}
            <button
              onClick={() => onNavigate('/dashboard/region/nadia')}
              className="flex items-center gap-2 shrink-0 opacity-60 hover:opacity-100 transition cursor-pointer"
            >
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px] font-mono">
                05
              </span>
              <span className="text-[11px] font-mono text-stone-600">05 IMPACT</span>
            </button>
          </nav>
        </div>

        {/* Hero / Introduction Header */}
        <header className="flex flex-col items-start gap-2 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#033aaf]/10 text-[#033aaf]">
            <span className="w-2 h-2 rounded-full bg-[#033aaf] animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase">
              BAAT2BADLAV AI · GEMINI 3.5 FLASH LITE INTERPRETATION PIPELINE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1c1e] tracking-tight">
            We received and structured your submission.
          </h1>
          <p className="text-base sm:text-lg text-[#444653] leading-relaxed max-w-3xl">
            Your community report has been interpreted and structured into development signals.
          </p>
          <div className="flex items-center gap-2 mt-1 py-1.5 px-3 rounded-lg bg-[#f3f3f6] text-[#444653] text-xs">
            <span className="material-symbols-outlined text-sm text-[#9e4200]">verified_user</span>
            <span>You can review your submission or return to edit it anytime.</span>
          </div>
        </header>

        {/* Dual-Column Desktop Architecture */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: The Actual Citizen Input (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#1a1c1e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9e4200]">
                    {isVoiceInput ? 'mic' : 'edit_note'}
                  </span>
                  Your submission
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#ffdbcb] text-[#341100] font-bold tracking-wider">
                  CITIZEN REPORT
                </span>
              </div>

              {/* Raw User Text Submission Callout */}
              <div className="p-4 rounded-xl bg-[#f3f3f6] flex flex-col gap-2 border border-stone-100">
                <span className="text-[11px] font-mono text-[#747685] uppercase tracking-wider">Submitted Situation</span>
                <p className="text-lg sm:text-xl font-semibold text-[#1a1c1e] leading-snug break-words">
                  "{userText}"
                </p>
              </div>

              {/* Input Metadata Badges */}
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#eeeef0] text-[#444653] font-medium">
                  {userLanguage}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#eeeef0] text-[#444653] font-medium">
                  {isVoiceInput ? `00:${durationSec < 10 ? '0' : ''}${durationSec} Voice snippet` : 'Text Entry'}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#eeeef0] text-[#444653] font-medium">
                  Category: {userCategory}
                </span>
              </div>

              {/* Audio Player Widget if Voice Mode was selected */}
              {isVoiceInput && (
                <div className="p-4 rounded-xl bg-[#eeeef0] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        aria-label="Play sample"
                        onClick={toggleAudio}
                        className="w-10 h-10 rounded-full bg-[#033aaf] text-white flex items-center justify-center shadow hover:bg-[#063baf] transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isPlayingAudio ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#1a1c1e]">Audio Simulation #{submission.id.slice(-4)}</span>
                        <span className="text-[11px] font-mono text-[#444653]">00:{durationSec < 10 ? '0' : ''}${durationSec} / 01:00</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-[#1a1c1e] font-semibold border border-stone-200">
                      1.0x
                    </span>
                  </div>

                  {/* Custom Waveform */}
                  <div aria-hidden="true" className="w-full flex items-center gap-1 h-8 pt-1">
                    {[12, 20, 28, 16, 24, 32, 20, 12, 24, 28, 16, 20, 28, 12, 24, 8, 16, 20, 12, 28, 16, 8].map(
                      (height, idx) => (
                        <span
                          key={idx}
                          className={`w-1 rounded-full transition-all ${
                            idx < 11
                              ? isPlayingAudio ? 'bg-[#033aaf] animate-pulse' : 'bg-[#033aaf]'
                              : 'bg-[#033aaf]/30'
                          }`}
                          style={{ height: `${height}px` }}
                        ></span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Location Metadata */}
              <div className="flex items-center gap-2 pt-1 text-sm font-medium text-[#1a1c1e]">
                <span className="material-symbols-outlined text-[#747685] text-lg">location_on</span>
                <span>Citizen-Selected: {userLocationString}</span>
              </div>

              {/* Location visual anchor indicator */}
              <div className="w-full h-32 rounded-xl bg-cover bg-center overflow-hidden shadow-inner flex items-end p-2.5 relative border border-stone-200 bg-stone-100">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <path d="M 10 50 Q 80 10 120 70 T 190 30" fill="none" stroke="#2e54c7" strokeWidth="2" strokeDasharray="3,3"></path>
                    <circle cx="120" cy="70" r="6" fill="#ba1a1a"></circle>
                  </svg>
                </div>
                <span className="relative z-10 px-2 py-1 rounded bg-[#2f3133]/90 text-white font-mono text-[11px] backdrop-blur-sm">
                  Citizen Location: {userGeoAnchor}
                </span>
              </div>

              {/* Integrity note */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#f3f3f6] text-[#444653]">
                <span className="material-symbols-outlined text-[#004f49] text-base mt-0.5">verified</span>
                <p className="text-xs leading-relaxed">
                  <strong className="text-[#1a1c1e] font-semibold">Preserved Privacy:</strong> Your text description is mapped to public administrative boundaries while personal contact details are excluded.
                </p>
              </div>

              {/* Edit action */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={handleBackToEdit}
                  className="text-xs font-semibold text-[#E06D28] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit this submission
                </button>
                <button
                  onClick={handleStartNew}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Start New Submission
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Interpretation & Structured Intelligence (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 1. LOADING STATE */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#033aaf] text-2xl animate-spin">
                      progress_activity
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e]">
                      AI Interpretation in Progress
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#dce1ff] text-[#033aaf] font-bold animate-pulse">
                    Gemini 3.5 Flash Lite
                  </span>
                </div>

                <p className="text-sm text-[#444653] leading-relaxed">
                  The civic interpretation engine is analyzing your report into structured development signals.
                </p>

                {/* Progressive Truthful Step Progress */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f3f3f6] border border-stone-100">
                    <span className="material-symbols-outlined text-[#004f49] text-lg">check_circle</span>
                    <span className="text-xs font-medium text-[#1a1c1e]">1. Preparing citizen report (Ingesting testimony &amp; location)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#dce1ff]/40 border border-[#b6c4ff]/60">
                    <span className="w-4 h-4 rounded-full border-2 border-[#033aaf] border-t-transparent animate-spin shrink-0"></span>
                    <span className="text-xs font-semibold text-[#033aaf]">2. Interpreting civic context (Analyzing clarity, severity &amp; urgency)...</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 opacity-60">
                    <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0"></span>
                    <span className="text-xs font-normal text-stone-500">3. Structuring development signals (Classifying domain &amp; key signals)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 opacity-60">
                    <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0"></span>
                    <span className="text-xs font-normal text-stone-500">4. Finalizing interpretation</span>
                  </div>
                </div>

                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-[#033aaf] h-full rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* 2. ERROR STATE */}
            {!isLoading && error && (
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 sm:p-8 flex flex-col gap-5">
                <div className="flex items-center gap-3 text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-3xl">error</span>
                  <div>
                    <h2 className="text-xl font-bold">AI Interpretation Unavailable</h2>
                    <span className="text-xs font-mono text-red-600">
                      {errorCode === 'MISSING_API_KEY' ? 'API Key Configuration Required' : 'Pipeline Error'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-50/80 border border-red-100 text-xs sm:text-sm text-red-800 leading-relaxed">
                  <p className="font-semibold mb-1">Notice:</p>
                  <p>{error}</p>
                  {errorCode === 'MISSING_API_KEY' && (
                    <div className="mt-3 pt-3 border-t border-red-200/60 text-xs text-red-700">
                      <strong>To enable live Gemini AI interpretation:</strong>
                      <ol className="list-decimal list-inside mt-1 space-y-0.5">
                        <li>Open the <code className="font-mono bg-red-100 px-1 py-0.5 rounded">.env.local</code> file in the project root.</li>
                        <li>Add your API key: <code className="font-mono bg-red-100 px-1 py-0.5 rounded">GEMINI_API_KEY=your_key_here</code>.</li>
                        <li>Click <strong>Try Again</strong> below to run the live interpretation.</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 rounded-xl bg-[#033aaf] hover:bg-[#063baf] text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={handleBackToEdit}
                    className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    <span>Return to Edit Submission</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. SUCCESS / INTERPRETATION DISPLAY */}
            {!isLoading && !error && interpretation && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#033aaf] text-2xl">auto_awesome</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e]">Structured AI Interpretation</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#dce1ff] text-[#033aaf] font-bold">
                      Gemini 3.5 Flash Lite
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#9cf2e8] text-[#004f49] font-bold">
                      {Math.round(interpretation.confidence * 100)}% Interpretation Clarity
                    </span>
                  </div>
                </div>

                {/* Extraction Breakdown Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Language */}
                  <div className="p-3.5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between gap-2 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold">Language</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#004f49]/10 text-[#004f49] font-bold">
                        Detected
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#1a1c1e]">{interpretation.detectedLanguage}</span>
                    <span className="text-xs text-[#444653]">Reported Region: {submission.location.stateName}</span>
                  </div>

                  {/* Civic Domain */}
                  <div className="p-3.5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between gap-2 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold">Civic Domain</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#033aaf]/10 text-[#033aaf] font-bold">
                        Classified
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#1a1c1e]">{interpretation.civicDomain}</span>
                    <span className="text-xs text-[#444653]">Controlled Application Domain</span>
                  </div>

                  {/* Primary Issue */}
                  <div className="p-3.5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between gap-2 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold">Primary Issue</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fe843e]/20 text-[#672800] font-bold">
                        Extracted
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#1a1c1e]">{interpretation.primaryIssue}</span>
                    <span className="text-xs text-[#444653]">{interpretation.normalizedSummary}</span>
                  </div>

                  {/* Urgency & Severity */}
                  <div className="p-3.5 rounded-xl bg-[#f3f3f6] flex flex-col justify-between gap-2 border border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold">Urgency &amp; Severity</span>
                      <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        interpretation.severity === 'Critical' || interpretation.urgency === 'Immediate'
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : interpretation.severity === 'High' || interpretation.urgency === 'Seasonal Risk'
                          ? 'bg-orange-100 text-[#9e4200]'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {interpretation.severity} / {interpretation.urgency}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#ba1a1a]">{interpretation.urgencyAssessment}</span>
                    <span className="text-xs text-[#444653]">{interpretation.urgencyReasoning}</span>
                  </div>

                  {/* Citizen-Reported Location Context (Span 2) */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#f3f3f6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-stone-100">
                    <div>
                      <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold block mb-0.5">
                        Citizen-Reported Location Context
                      </span>
                      <span className="text-sm font-semibold text-[#1a1c1e]">
                        {submission.location.districtName}, {submission.location.stateName}
                        {submission.location.locality ? ` · ${submission.location.locality}` : ''}
                      </span>
                      <span className="text-xs text-[#444653] block mt-0.5">
                        {interpretation.extractedLocations && interpretation.extractedLocations.length > 0
                          ? `Text mentions: ${interpretation.extractedLocations.join(', ')}`
                          : 'No additional locality names mentioned in submission text.'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-[#9cf2e8] text-[#004f49] font-bold flex items-center gap-1 shrink-0">
                      <span className="material-symbols-outlined text-sm">location_city</span>
                      Citizen-Selected District
                    </span>
                  </div>
                </div>

                {/* Key Signals / Extracted Entities */}
                {interpretation.entitiesOrSignals && interpretation.entitiesOrSignals.length > 0 && (
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#f9f9fc] border border-stone-100">
                    <span className="text-[11px] font-mono text-[#747685] uppercase font-semibold">
                      Extracted Civic Signals &amp; Key Factors
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {interpretation.entitiesOrSignals.map((sig, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white text-stone-800 text-xs font-semibold border border-stone-200 shadow-2xs flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#033aaf]"></span>
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interpretation Clarity Rationale */}
                {interpretation.confidenceBasis && (
                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900 flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-sky-600 text-base mt-0.5">psychology</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sky-950">Interpretation Clarity Rationale:</span>
                      <p className="leading-relaxed text-sky-800">{interpretation.confidenceBasis}</p>
                    </div>
                  </div>
                )}

                {/* Structured Signal Transformation Summary */}
                <div className="p-6 rounded-2xl bg-[#eeeef0] flex flex-col gap-4 relative border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                      Structured Signal Transformation
                    </span>
                    <span className="material-symbols-outlined text-[#033aaf]">hub</span>
                  </div>

                  {/* Transformation Flow Diagram */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-[#1a1c1e]">
                    <div className="flex-1 p-2.5 rounded bg-white text-center border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-mono text-[#747685] block">Citizen Input</span>
                      <span className="text-xs font-medium text-[#1a1c1e] truncate block">"{userText.slice(0, 24)}..."</span>
                    </div>
                    <span className="material-symbols-outlined text-[#747685] text-center rotate-90 sm:rotate-0">
                      arrow_forward
                    </span>
                    <div className="flex-1 p-2.5 rounded bg-white text-center border border-stone-200 shadow-2xs">
                      <span className="text-[10px] font-mono text-[#747685] block">Interpreted Issue</span>
                      <span className="text-xs font-medium text-[#1a1c1e] truncate block">{interpretation.primaryIssue}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#747685] text-center rotate-90 sm:rotate-0">
                      arrow_forward
                    </span>
                    <div className="flex-1 p-2.5 rounded bg-[#dce1ff] text-[#033aaf] text-center border border-[#b6c4ff] shadow-2xs">
                      <span className="text-[10px] font-mono text-[#033aaf] block">Civic Domain</span>
                      <span className="text-xs font-bold truncate block">{interpretation.civicDomain}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Semantic Normalization Strip */}
        <section className="w-full bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#9e4200]">merge</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e]">
                Semantic Normalization: Different voices. One shared signal.
              </h2>
            </div>
            <p className="text-sm text-[#444653]">
              Baat2Badlav connects individual community reports with sectoral themes across {submission.location.stateName}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f3f3f6] border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                Active Signal: {submission.location.districtName} (
                {interpretation ? interpretation.civicDomain : userCategory})
              </span>
            </div>
            <span className="font-mono text-stone-500 text-[11px]">
              {interpretation ? `Domain: ${interpretation.civicDomain}` : 'Signal Ingestion Active'}
            </span>
          </div>
        </section>

        {/* Bottom Primary Action Bar */}
        <aside aria-label="District Connection Actions" className="w-full bg-[#2f3133] text-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-[11px] font-mono text-[#80d5cb] uppercase tracking-wider font-bold">
              Development Signal Ready
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to explore community signals across {submission.location.districtName}?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              View how citizen reports in {submission.location.stateName} connect across civic domains.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleBackToEdit}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs sm:text-sm font-semibold text-center transition-colors cursor-pointer"
            >
              Back to my request
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#fe843e] hover:bg-[#9e4200] text-white text-xs sm:text-sm font-bold text-center shadow-lg transition-colors flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>See the Development Signal</span>
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                trending_up
              </span>
            </button>
          </div>
        </aside>

      </div>
    </main>
  );
};
