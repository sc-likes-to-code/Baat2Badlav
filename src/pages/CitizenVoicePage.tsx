import React, { useState, useEffect } from 'react';
import {
  CitizenSubmission,
  CitizenFormDraft,
  LanguageCode,
  CivicCategory,
  InputMode,
  CitizenFormValidationErrors,
} from '../types/citizen';
import {
  PROTOTYPE_STATES,
  getDistrictsForState,
  getStateName,
  getDistrictName,
} from '../data/locations';

interface CitizenVoicePageProps {
  onNavigate: (path: string) => void;
  draft?: CitizenFormDraft | null;
  onSaveDraft?: (draft: CitizenFormDraft) => void;
  onSubmitSubmission?: (submission: CitizenSubmission) => void;
  onResetSubmission?: () => void;
}

const CATEGORIES: { label: CivicCategory; icon: string }[] = [
  { label: 'Roads & Mobility', icon: '🛣️' },
  { label: 'Water Access', icon: '💧' },
  { label: 'Healthcare Access', icon: '🏥' },
  { label: 'Electricity & Power', icon: '⚡' },
  { label: 'School Facilities', icon: '🏫' },
];

export const CitizenVoicePage: React.FC<CitizenVoicePageProps> = ({
  onNavigate,
  draft,
  onSaveDraft,
  onSubmitSubmission,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(draft?.language || 'en');
  const [inputMode, setInputMode] = useState<InputMode>(draft?.inputMode || 'voice');
  const [isRecording, setIsRecording] = useState<boolean>(draft?.isRecording ?? false);
  const [isPaused, setIsPaused] = useState<boolean>(draft?.isPaused ?? false);
  const [seconds, setSeconds] = useState<number>(draft?.recordingSeconds ?? 0);
  const [inputText, setInputText] = useState<string>(draft?.text ?? '');
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory | ''>(draft?.category || '');
  const [selectedState, setSelectedState] = useState<string>(draft?.stateId || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(draft?.districtId || '');
  const [locality, setLocality] = useState<string>(draft?.locality ?? '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<number>(0);
  const [errors, setErrors] = useState<CitizenFormValidationErrors>({});
  const [piiWarning, setPiiWarning] = useState<string | null>(null);

  // Synchronize state ONLY when the draft prop reference changes externally (e.g., on reset or edit restore)
  useEffect(() => {
    if (draft) {
      setSelectedLanguage(draft.language || 'en');
      setInputMode(draft.inputMode || 'voice');
      setIsRecording(draft.isRecording ?? false);
      setIsPaused(draft.isPaused ?? false);
      setSeconds(draft.recordingSeconds ?? 0);
      setInputText(draft.text ?? '');
      setSelectedCategory(draft.category || '');
      setSelectedState(draft.stateId || '');
      setSelectedDistrict(draft.districtId || '');
      setLocality(draft.locality ?? '');
    } else {
      setSelectedLanguage('en');
      setInputMode('voice');
      setIsRecording(false);
      setIsPaused(false);
      setSeconds(0);
      setInputText('');
      setSelectedCategory('');
      setSelectedState('');
      setSelectedDistrict('');
      setLocality('');
    }
    setErrors({});
    setPiiWarning(null);
  }, [draft]);

  // Lightweight PII detection guardrail
  useEffect(() => {
    const phonePattern = /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/;
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const addressPattern = /\b(?:house|flat|h\.no|door|plot)\s*(?:no\.?|number)?\s*[:#-]?\s*\d+/i;

    if (phonePattern.test(inputText)) {
      setPiiWarning('Gentle reminder: A phone number was detected. Please avoid sharing personal contact numbers.');
    } else if (emailPattern.test(inputText)) {
      setPiiWarning('Gentle reminder: An email address was detected. Please avoid sharing personal email addresses.');
    } else if (addressPattern.test(inputText)) {
      setPiiWarning('Gentle reminder: An exact house/door number was detected. Approximate neighborhood locations are sufficient.');
    } else {
      setPiiWarning(null);
    }
  }, [inputText]);

  // Timer effect for voice simulation
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused && seconds < 60) {
      interval = setInterval(() => {
        setSeconds((prev) => (prev >= 60 ? 60 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, seconds]);

  const handleMicToggle = () => {
    setInputMode('voice');
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
    } else {
      setIsRecording(false);
    }
  };

  const handleSuggestionClick = (prompt: string, category: CivicCategory) => {
    setInputText(prompt);
    setSelectedCategory(category);
    if (errors.text || errors.category) {
      setErrors((prev) => ({ ...prev, text: undefined, category: undefined }));
    }
  };

  const handleStateChange = (newStateId: string) => {
    setSelectedState(newStateId);
    setSelectedDistrict('');
    setLocality('');
    if (errors.stateId || errors.districtId) {
      setErrors((prev) => ({ ...prev, stateId: undefined, districtId: undefined }));
    }
  };

  const handleDistrictChange = (newDistrictId: string) => {
    setSelectedDistrict(newDistrictId);
    if (errors.districtId) {
      setErrors((prev) => ({ ...prev, districtId: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: CitizenFormValidationErrors = {};
    const trimmed = inputText.trim();

    if (!trimmed) {
      newErrors.text = 'Please describe the situation affecting your community.';
    } else if (trimmed.length < 30) {
      newErrors.text = `Please describe the issue in at least 30 characters (currently ${trimmed.length} characters).`;
    } else if (trimmed.length > 500) {
      newErrors.text = 'Description exceeds the maximum limit of 500 characters.';
    }

    if (!selectedState) {
      newErrors.stateId = 'Please select a state.';
    }

    if (!selectedDistrict) {
      newErrors.districtId = 'Please select a district.';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a primary category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Scroll to the first error area
      const el = document.getElementById('submission-flow');
      el?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const currentDraft: CitizenFormDraft = {
      language: selectedLanguage,
      inputMode,
      text: inputText.trim(),
      stateId: selectedState,
      districtId: selectedDistrict,
      locality: locality.trim(),
      category: selectedCategory as CivicCategory,
      isRecording: false,
      isPaused: false,
      recordingSeconds: seconds,
    };

    if (onSaveDraft) {
      onSaveDraft(currentDraft);
    }

    const submission: CitizenSubmission = {
      id: `sub-${Date.now()}`,
      language: selectedLanguage,
      inputMode,
      text: inputText.trim(),
      location: {
        country: 'India',
        stateId: selectedState,
        stateName: getStateName(selectedState),
        districtId: selectedDistrict,
        districtName: getDistrictName(selectedState, selectedDistrict),
        locality: locality.trim() || undefined,
      },
      category: selectedCategory as CivicCategory,
      createdAt: new Date().toISOString(),
      recordingDurationSeconds: inputMode === 'voice' && seconds > 0 ? seconds : undefined,
    };

    setIsSubmitting(true);
    setSubmissionProgress(1);

    setTimeout(() => {
      setSubmissionProgress(2);
    }, 800);

    setTimeout(() => {
      setSubmissionProgress(3);
    }, 1600);

    setTimeout(() => {
      if (onSubmitSubmission) {
        onSubmitSubmission(submission);
      }
      onNavigate('/citizen/result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2400);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `00:${remainingSecs < 10 ? '0' : ''}${remainingSecs} / 01:00`;
  };

  const availableDistricts = selectedState ? getDistrictsForState(selectedState) : [];
  const stateLabel = selectedState ? getStateName(selectedState) : '';
  const districtLabel = selectedState && selectedDistrict ? getDistrictName(selectedState, selectedDistrict) : '';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
      {/* Top Intro Section */}
      <section className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#E06D28] text-xs font-mono tracking-wide uppercase font-semibold mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E06D28]"></span>
          </span>
          Share what your community experiences
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111315] mb-3">
          What does your community need?
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          Tell Baat2Badlav about something affecting everyday life in your community. Your voice helps reveal patterns across places.
        </p>
        <p className="mt-2 text-xs font-mono text-stone-500">
          You can speak or type in <span className="text-stone-800 font-medium">বাংলা</span>,{' '}
          <span className="text-stone-800 font-medium">हिन्दी</span>, or{' '}
          <span className="text-stone-800 font-medium">English</span>.
        </p>
      </section>

      {/* Language Selector Section */}
      <section aria-label="Language selection" className="max-w-md mx-auto mb-8 text-center">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2.5">
          Choose your language
        </p>
        <div className="inline-flex p-1 bg-stone-100/90 rounded-full border border-stone-200 shadow-inner" role="group">
          <button
            onClick={() => setSelectedLanguage('bn')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              selectedLanguage === 'bn'
                ? 'bg-[#111315] text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            {selectedLanguage === 'bn' && (
              <svg className="w-3.5 h-3.5 text-[#E06D28]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  fillRule="evenodd"
                ></path>
              </svg>
            )}
            বাংলা
          </button>
          <button
            onClick={() => setSelectedLanguage('hi')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              selectedLanguage === 'hi'
                ? 'bg-[#111315] text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            {selectedLanguage === 'hi' && (
              <svg className="w-3.5 h-3.5 text-[#E06D28]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z"
                  fillRule="evenodd"
                ></path>
              </svg>
            )}
            हिन्दी
          </button>
          <button
            onClick={() => setSelectedLanguage('en')}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
              selectedLanguage === 'en'
                ? 'bg-[#111315] text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            {selectedLanguage === 'en' && (
              <svg className="w-3.5 h-3.5 text-[#E06D28]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z"
                  fillRule="evenodd"
                ></path>
              </svg>
            )}
            English
          </button>
        </div>
      </section>

      {/* Main Input Centerpiece Card */}
      <section
        className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow mb-8"
        id="submission-flow"
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111315]">
            Tell us what you're experiencing
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Speak naturally. Baat2Badlav will identify the development issue and organize your request.
          </p>
        </div>

        {/* Voice Recording Simulation Box */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden mb-8">
          {/* Top Status Bar in Voice Area */}
          <div className="flex items-center justify-between mb-6 text-xs font-mono">
            <div className="inline-flex items-center gap-2 text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
              <span>
                {isRecording ? 'Voice Ingestion Live' : (seconds > 0 ? 'Audio Recorded' : 'Ready to Record')}
              </span>
            </div>
            <div className="text-stone-700 font-semibold px-2.5 py-1 bg-white rounded-md border border-stone-200">
              {formatTimer(seconds)}
            </div>
          </div>

          {/* Center Recording Mic & Dynamic Waveform */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative group">
              {isRecording && (
                <div className="absolute -inset-3 bg-orange-100 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
              )}
              <button
                aria-label="Microphone recording button"
                onClick={handleMicToggle}
                className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#E06D28] to-orange-500 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
                type="button"
              >
                <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </div>

            <p className="mt-4 font-semibold text-stone-800 text-sm tracking-wide">
              {isRecording ? 'Listening...' : (seconds > 0 ? 'Tap mic to resume recording' : 'Tap mic to speak')}
            </p>

            {/* Waveform visualizer simulation */}
            <div aria-label="Audio waveform indicator" className="flex items-center gap-1.5 h-8 mt-2">
              <span className={`wave-bar w-1 ${isRecording ? 'bg-[#E06D28]' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-orange-400' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-[#E06D28]' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-amber-500' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-[#E06D28]' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-orange-400' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-[#E06D28]' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-amber-500' : 'bg-stone-300'} rounded-full`}></span>
              <span className={`wave-bar w-1 ${isRecording ? 'bg-[#E06D28]' : 'bg-stone-300'} rounded-full`}></span>
            </div>
          </div>

          <p className="text-xs text-stone-500 max-w-md mx-auto mt-4">
            Tap to speak. You can speak naturally in your selected language. Audio is transcribed and scrubbed of personal identifiers.
          </p>
        </div>

        {/* Divider: Or Type */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono tracking-widest text-stone-600">
            <span className="bg-white px-4">or type your experience</span>
          </div>
        </div>

        {/* Editorial Textarea Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="citizen-voice-text">
            Describe the situation in your own words
          </label>
          <div
            className={`relative rounded-2xl border transition-all bg-white p-3.5 ${
              errors.text
                ? 'border-red-400 ring-2 ring-red-100'
                : 'border-stone-300 focus-within:border-stone-900 focus-within:ring-2 focus-within:ring-stone-900/10'
            }`}
          >
            <textarea
              className="w-full border-0 p-0 text-stone-800 placeholder-stone-400 outline-none focus:outline-none focus:ring-0 text-base leading-relaxed resize-none"
              id="citizen-voice-text"
              rows={4}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setInputMode('text');
                if (errors.text) {
                  setErrors((prev) => ({ ...prev, text: undefined }));
                }
              }}
              placeholder="“For example: The road connecting our village becomes very difficult to use during the monsoon.”"
            />
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500 font-mono mt-2">
              <span className="inline-flex items-center gap-1.5 text-[#0F766E]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                {inputMode === 'voice' && seconds > 0 ? 'Audio note transcribed' : 'Written text entry'}
              </span>
              <span className={inputText.length > 500 ? 'text-red-600 font-bold' : 'text-stone-400'}>
                {inputText.length} / 500 characters
              </span>
            </div>
          </div>

          {/* Inline Validation Error */}
          {errors.text && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {errors.text}
            </p>
          )}

          {/* Gentle PII Warning Banner */}
          {piiWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2 mt-2">
              <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">shield</span>
              <div className="flex-1">
                <span className="font-semibold block">{piiWarning}</span>
                <span className="text-[11px] text-amber-700">Approximate village/block locations protect privacy while providing full civic context.</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4 pt-2">
          <p className="text-xs font-medium text-stone-500 mb-2">Not sure where to start? Tap a common topic:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleSuggestionClick(
                  'The road connecting our village becomes very difficult to use during the monsoon.',
                  'Roads & Mobility'
                )
              }
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-normal px-3 py-1.5 rounded-lg border border-stone-200/80 transition text-left cursor-pointer"
              type="button"
            >
              “Our village road becomes unusable during monsoon.”
            </button>
            <button
              onClick={() =>
                handleSuggestionClick(
                  'Our community well water has high salinity and the piped connection has zero pressure since last month.',
                  'Water Access'
                )
              }
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-normal px-3 py-1.5 rounded-lg border border-stone-200/80 transition text-left cursor-pointer"
              type="button"
            >
              “We don't get reliable drinking water.”
            </button>
            <button
              onClick={() =>
                handleSuggestionClick(
                  'The nearest health sub-centre is over 12km away and no ambulance reaches during emergencies.',
                  'Healthcare Access'
                )
              }
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-normal px-3 py-1.5 rounded-lg border border-stone-200/80 transition text-left cursor-pointer"
              type="button"
            >
              “The nearest health centre is too far away.”
            </button>
          </div>
        </div>
      </section>

      {/* Location Context Section */}
      <section aria-label="Location context" className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-[#E06D28] shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#111315]">Where is this happening?</h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Location helps us understand where similar needs are emerging across regions.
            </p>
          </div>
        </div>

        {/* Location Input Hierarchy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Country</label>
            <div className="bg-stone-100/90 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-700 flex items-center justify-between">
              <span>India</span>
              <span className="text-xs text-stone-400 font-mono">Preset</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="state-select">
              State
            </label>
            <div className="relative">
              <select
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  !selectedState ? 'text-stone-400' : 'text-stone-800'
                } outline-none focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition cursor-pointer ${
                  errors.stateId ? 'border-red-400 ring-1 ring-red-100' : 'border-stone-300'
                }`}
                id="state-select"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="" disabled className="text-stone-400">
                  Select State
                </option>
                {PROTOTYPE_STATES.map((s) => (
                  <option key={s.id} value={s.id} className="text-stone-800">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.stateId && <p className="text-[11px] text-red-600 mt-1">{errors.stateId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="district-select">
              District
            </label>
            <div className="relative">
              <select
                disabled={!selectedState}
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  !selectedDistrict ? 'text-stone-400' : 'text-stone-800'
                } outline-none focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition cursor-pointer disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed ${
                  errors.districtId ? 'border-red-400 ring-1 ring-red-100' : 'border-stone-300'
                }`}
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value="" disabled className="text-stone-400">
                  {selectedState ? 'Select District' : 'Select State first'}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id} className="text-stone-800">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.districtId && <p className="text-[11px] text-red-600 mt-1">{errors.districtId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="locality-input">
              Locality / GP <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition placeholder:text-stone-400"
              id="locality-input"
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Chapra Block"
            />
          </div>
        </div>

        {/* Privacy Note Box */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
          <span>Approximate location is enough. Please do not share private addresses or personal contact information.</span>
        </div>
      </section>

      {/* Category Tagging Section */}
      <section aria-label="Category Tagging" className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm mb-8">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111315]">
            What is this mainly about? <span className="text-xs font-normal text-stone-400">(Primary domain)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Select the most relevant infrastructure or community service category.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedCategory(cat.label);
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: undefined }));
                  }
                }}
                type="button"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#111315] text-white shadow-xs border border-stone-900'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-[#E06D28]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-red-600 mt-2">{errors.category}</p>}
      </section>

      {/* Review Dossier Preview */}
      <section aria-label="Review Dossier" className="bg-stone-100/70 rounded-3xl border border-stone-200 p-6 sm:p-7 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 font-mono">
              Ready to share? · Review Summary
            </h2>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('submission-flow');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-[#E06D28] hover:underline cursor-pointer"
            type="button"
          >
            Edit
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block uppercase font-mono tracking-wider mb-1">Language &amp; Source</span>
            <span className="font-semibold text-stone-800">
              {selectedLanguage === 'en'
                ? 'English'
                : selectedLanguage === 'bn'
                ? 'Bengali'
                : 'Hindi'}{' '}
              ({inputMode === 'voice' && seconds > 0 ? 'Voice note' : 'Written text'})
            </span>
          </div>
          <div>
            <span className="text-stone-400 block uppercase font-mono tracking-wider mb-1">Location Anchor</span>
            {selectedState && selectedDistrict ? (
              <span className="font-semibold text-stone-800">
                {districtLabel}, {stateLabel} {locality ? `· ${locality}` : ''}
              </span>
            ) : (
              <span className="text-stone-400 italic">Location not selected</span>
            )}
          </div>
          <div className="md:col-span-2 pt-2 border-t border-stone-100">
            <span className="text-stone-400 block uppercase font-mono tracking-wider mb-1">Verified Input Snippet</span>
            <p className="text-stone-800 italic font-medium">“{inputText.trim() || 'No description entered yet.'}”</p>
          </div>
          <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-stone-100 text-stone-500">
            <span className="font-mono">
              Selected Domain:{' '}
              {selectedCategory ? (
                <strong className="text-[#111315]">{selectedCategory}</strong>
              ) : (
                <span className="text-stone-400 font-normal italic">Not selected</span>
              )}
            </span>
            <span className="bg-stone-100 text-stone-600 font-mono px-2 py-0.5 rounded text-[11px] font-semibold border border-stone-200">
              Review Status: {inputText.trim() && selectedState && selectedDistrict && selectedCategory ? 'Ready' : 'Incomplete'}
            </span>
          </div>
        </div>
      </section>

      {/* Trust & Principles Strip */}
      <section aria-label="Responsible AI and Trust" className="mb-10">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 font-mono">
            Your voice, handled responsibly
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80">
            <div className="text-stone-900 font-bold text-sm mb-1">Minimal information</div>
            <p className="text-xs text-stone-500 leading-normal">
              We only ask for what helps understand the development need. No invasive personal data collected.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80">
            <div className="text-stone-900 font-bold text-sm mb-1">No exact address</div>
            <p className="text-xs text-stone-500 leading-normal">
              Approximate location is sufficient. Personally identifiable information is scrubbed automatically.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80">
            <div className="text-stone-900 font-bold text-sm mb-1">Human-led decisions</div>
            <p className="text-xs text-stone-500 leading-normal">
              Your contribution informs development intelligence. It does not automatically determine funding decisions.
            </p>
          </div>
        </div>
        <div className="mt-3 text-right">
          <button
            onClick={() => onNavigate('/trust')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Learn about Data &amp; Trust <span>→</span>
          </button>
        </div>
      </section>

      {/* Submission Action & Transition Preview */}
      <section aria-label="Submission Action" className="text-center pt-2 pb-6">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#111315] hover:bg-stone-800 text-white font-semibold text-base px-10 py-4 rounded-2xl shadow-md hover:shadow-lg transition transform active:scale-[0.99] border border-stone-800 group cursor-pointer disabled:opacity-80"
          type="button"
        >
          <span>{isSubmitting ? 'Analyzing Voice Signal...' : 'Share My Voice'}</span>
          <svg
            className="w-5 h-5 text-[#E06D28] group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
        <p className="text-xs text-stone-500 mt-3 font-mono">
          Your submission will be organized into structured civic intelligence.
        </p>

        {/* Dynamic Transition / Next Pipeline Preview Box */}
        <div className="mt-8 text-left bg-stone-900 text-stone-200 rounded-2xl p-5 border border-stone-800 shadow-xl max-w-xl mx-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <span className="flex items-center gap-2 text-stone-400">
              <span className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              {isSubmitting ? 'Processing Submission...' : 'Ready to understand your voice...'}
            </span>
            <span className="text-[11px] text-stone-500">Pipeline Ingestion Preview</span>
          </div>
          <div className="space-y-2 mt-3 text-stone-300">
            <div className={`flex items-center gap-2 ${submissionProgress >= 1 ? 'text-emerald-400 font-bold' : 'text-stone-400'}`}>
              <span>{submissionProgress >= 1 ? '✓' : '○'}</span>
              <span>
                {selectedLanguage === 'bn'
                  ? 'Bengali (বাংলা)'
                  : selectedLanguage === 'hi'
                  ? 'Hindi (हिन्दी)'
                  : 'English'}{' '}
                submission verified
              </span>
            </div>
            <div className={`flex items-center gap-2 ${submissionProgress >= 2 ? 'text-emerald-400 font-bold' : 'text-stone-400'}`}>
              <span>{submissionProgress >= 2 ? '✓' : '○'}</span>
              <span>Extracting {selectedCategory || 'civic'} entity...</span>
            </div>
            <div className={`flex items-center gap-2 ${submissionProgress >= 3 ? 'text-emerald-400 font-bold' : 'text-stone-400'}`}>
              <span>{submissionProgress >= 3 ? '✓' : '○'}</span>
              <span>Cross-referencing {districtLabel || 'district'}, {stateLabel || 'state'} baseline GIS...</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span>Voice → Understanding → Development Intelligence</span>
            <span className="text-stone-500">Prototype Demo Pipeline</span>
          </div>
        </div>
      </section>
    </main>
  );
};
