import React, { useState, useRef, useEffect } from 'react';
import { HOTSPOTS } from '../data/mockData';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleAudio = (id: string, src: string) => {
    if (playingSample === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSample(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingSample(null);
      };
      audio.onerror = () => {
        setPlayingSample(null);
      };
      audio.play().catch(() => {
        setPlayingSample(null);
      });
      setPlayingSample(id);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const pipelineSteps = [
    {
      num: '01',
      id: 'listen',
      title: 'Multilingual Ingestion',
      subtitle: 'Citizen Voice',
      desc: 'Rural citizens submit real-world lived friction via voice note, phone IVR, or text in 12+ Indian vernacular languages.',
      metric: '94,200+ Voices Processed',
      badge: 'Step 1: Voice Note / Audio',
      path: '/citizen',
    },
    {
      num: '02',
      id: 'understand',
      title: 'AI Translation & Extraction',
      subtitle: 'Gemini 1.5 Civic Normalization',
      desc: 'Nuanced regional speech is transliterated, dialectal terms decoded, and mapped to gazetted government scheme taxonomies (PMGSY, JJM, NRHM).',
      metric: '98.4% Dialectal Recall',
      badge: 'Step 2: Semantic Analysis',
      path: '/citizen/result',
    },
    {
      num: '03',
      id: 'cluster',
      title: 'Spatial Micro-Clustering',
      subtitle: 'Demand Concentration',
      desc: 'Anonymized requests within micro-watershed basins are grouped using spatial affinity algorithms, stripping personal identifiers.',
      metric: '1,420 Active Basins',
      badge: 'Step 3: Privacy & Aggregation',
      path: '/dashboard',
    },
    {
      num: '04',
      id: 'evidence',
      title: 'Public Evidence Synthesis',
      subtitle: 'Multi-Source Ground Truth',
      desc: 'Demand is overlaid against official infrastructure baselines (PMGSY, JJM), Census demographics, and sanctioned expenditure to score unmet gaps.',
      metric: '6 Public Registries Synced',
      badge: 'Step 4: Composite Scoring',
      path: '/dashboard',
    },
    {
      num: '05',
      id: 'simulate',
      title: 'Intervention Simulator',
      subtitle: 'Impact & Feasibility Modeling',
      desc: 'District collectors and civic leaders explore candidate infrastructure interventions, modeled budgets, and projected gap reductions.',
      metric: '3-Year Gap Projections',
      badge: 'Step 5: Scenario Evaluation',
      path: '/dashboard/region/nadia',
    },
    {
      num: '06',
      id: 'decision',
      title: 'Human Decision Supremacy',
      subtitle: 'Constitutional Governance',
      desc: 'AI never authorizes spending. Comprehensive evidence dossiers support elected Gram Sabhas and District Planners in setting budget priorities.',
      metric: 'Zero Autonomous Sanctions',
      badge: 'Step 6: Democratic Oversight',
      path: '/trust',
    },
  ];

  const audioSamples = [
    {
      id: 'bengali-nadia',
      lang: 'Bengali (বাংলা)',
      region: 'Nadia, West Bengal',
      audioSrc: '/audio/bengali_nadia.m4a',
      audioText: '"আমাদের এলাকায় বর্ষাকালে রাস্তা পুরোপুরি ডুবে যায়। মায়েরা হাসপাতালে যেতে পারে না..."',
      translation: '"In our area during monsoons, the road completely submerges. Expectant mothers cannot reach the sub-centre hospital..."',
      sector: 'Roads & Mobility',
      urgency: 'Seasonal High',
    },
    {
      id: 'hindi-gaya',
      lang: 'Hindi (हिन्दी)',
      region: 'Gaya, Bihar',
      audioSrc: '/audio/hindi_gaya.m4a',
      audioText: '"हैंडपंप का पानी बिल्कुल लाल और बालू जैसा निकलता है। बच्चे बीमार पड़ रहे हैं..."',
      translation: '"The handpump water runs red with sediment. Schoolchildren are falling sick with stomach ailments every week..."',
      sector: 'Water Access',
      urgency: 'Immediate Deficit',
    },
    {
      id: 'odia-kalahandi',
      lang: 'Odia (ଓଡ଼ିଆ)',
      region: 'Kalahandi, Odisha',
      audioSrc: '/audio/odia_kalahandi.m4a',
      audioText: '"ସବୁଦିନ ପାୱାର କଟିଂ ହେଉଛି, ଗ୍ରୀଷ୍ମରେ କ୍ଲିନିକ୍ ଔଷଧ ନଷ୍ଟ ହୋଇଯାଉଛି..."',
      translation: '"Daily unannounced power outages last 8 hours; cold-chain medicines in our primary health centre are spoiling..."',
      sector: 'Healthcare & Power',
      urgency: 'Critical Baseline',
    },
  ];

  return (
    <div className="bg-[#FAF7EE] min-h-screen text-[#1B2A32] flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#E3DECE] bg-radial from-[#F5EFE0] via-[#FAF7EE] to-[#FAF7EE]">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#E7E0CE_1px,transparent_1px),linear-gradient(to_bottom,#E7E0CE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Brand Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-[#D5CEBC] shadow-xs text-xs font-semibold text-[#2F444E] mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A6F62] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A6F62]"></span>
            </span>
            <span className="tracking-wide">INDIA-FIRST DEVELOPMENT INTELLIGENCE</span>
            <span className="text-[#8FA1A9]">|</span>
            <span className="text-[#D46B28] font-bold">12 Vernacular Languages</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#112026] tracking-tight leading-[1.08] max-w-5xl mx-auto">
            From Citizen Voices to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A6F62] via-[#245D54] to-[#D46B28]">
              Development Intelligence
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-[#4A5E68] max-w-3xl mx-auto font-normal leading-relaxed">
            Baat2Badlav transforms everyday multilingual community experiences into structured, verifiable evidence by cross-referencing citizen demand with national infrastructure baselines, demographic exposure, and public investment data.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={() => onNavigate('/citizen')}
              className="w-full sm:w-auto px-8 py-4 bg-[#D46B28] hover:bg-[#BF5C1F] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <svg className="w-5 h-5 text-white transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              <span>Share a Need (Voice or Text)</span>
            </button>

            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-[#1B2A32] hover:bg-[#2A3F4B] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Intelligence Dashboard</span>
              <svg className="w-4 h-4 text-[#A8BDC7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Governance Notice */}
          <p className="mt-4 text-xs text-[#6F828C] max-w-xl mx-auto">
            A civic decision-support platform. Baat2Badlav identifies potential development gaps to inform public planning; it does not automatically disburse funds.
          </p>

          {/* Trust Strip Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 border border-[#E3DECE] p-4 rounded-xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[#1A6F62] font-mono">94,200+</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Citizen Testimonies</div>
              <div className="text-[11px] text-[#697C85] mt-1">Ground-truthed audio & text</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] p-4 rounded-xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[#D46B28] font-mono">6 Public APIs</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Cross-Referenced</div>
              <div className="text-[11px] text-[#697C85] mt-1">PMGSY, JJM, Census, Bhuvan</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] p-4 rounded-xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[#265366] font-mono">1,420</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Micro-Basins Mapped</div>
              <div className="text-[11px] text-[#697C85] mt-1">Spatial affinity clusters</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] p-4 rounded-xl shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-[#8A3A2C] font-mono">100% Zero PII</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Constitutional Privacy</div>
              <div className="text-[11px] text-[#697C85] mt-1">Anonymized prior to clustering</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PIPELINE: "A VOICE IS ONLY THE BEGINNING" */}
      <section className="py-20 border-b border-[#E3DECE] bg-[#FAF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#D46B28] tracking-widest uppercase font-mono">
              The Architecture of Transformation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112026] mt-2 mb-4 tracking-tight">
              A Voice is Only the Beginning
            </h2>
            <p className="text-base text-[#52656F] leading-relaxed">
              Raw complaints often get lost in isolation. Baat2Badlav converts spoken dialectal accounts into structured, evidence-backed civic priorities through an auditable six-stage pipeline.
            </p>
          </div>

          {/* Interactive Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pipelineSteps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => onNavigate(step.path)}
                className={`group cursor-pointer rounded-2xl p-6 sm:p-7 border transition-all duration-200 relative flex flex-col justify-between ${
                  activeStep === idx
                    ? 'bg-white border-[#1A6F62] shadow-md ring-1 ring-[#1A6F62]'
                    : 'bg-white/80 border-[#E3DECE] hover:border-[#B5CECE] hover:bg-white shadow-xs'
                }`}
                onMouseEnter={() => setActiveStep(idx)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-[#D46B28]">{step.num}</span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#FAF5E9] text-[#785F2C] border border-[#E6DCC8]">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#112026] group-hover:text-[#1A6F62] transition-colors">
                    {step.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#1A6F62] mt-0.5 mb-2 font-mono">
                    {step.subtitle}
                  </div>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE5D7] flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-[#2E4550]">{step.metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CITIZEN TESTIMONIAL AUDIOS & MULTILINGUAL PARITY */}
      <section className="py-20 border-b border-[#E3DECE] bg-[#F5EFE0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[#1A6F62] tracking-widest uppercase font-mono">
                Multilingual Vernacular Ingestion
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112026] mt-2 mb-4 tracking-tight">
                Listen to What Real Communities Are Experiencing
              </h2>
              <p className="text-sm text-[#50636D] leading-relaxed">
                India speaks in thousands of dialects. Baat2Badlav eliminates digital and textual barriers by allowing any villager to speak their mind naturally. Below are actual anonymized recordings captured in the field.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/citizen')}
              className="px-6 py-3 bg-[#1A6F62] hover:bg-[#13544A] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start lg:self-center"
            >
              <span>Record a Voice Note</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Audio Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audioSamples.map((sample) => (
              <div
                key={sample.id}
                className="bg-white border border-[#E3DECE] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#1A6F62]">{sample.lang}</span>
                    <span className="text-[11px] font-mono bg-[#FAF7EE] text-[#566A73] px-2 py-0.5 rounded border border-[#E5DFD0]">
                      {sample.region}
                    </span>
                  </div>

                  {/* Play audio button */}
                  <div className="bg-[#FAF8F2] border border-[#E4DFD0] rounded-xl p-3.5 my-3 flex items-center gap-3">
                    <button
                      onClick={() => handleToggleAudio(sample.id, sample.audioSrc)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        playingSample === sample.id
                          ? 'bg-[#D46B28] text-white shadow-xs'
                          : 'bg-[#1B2A32] text-white hover:bg-[#2A3F4B]'
                      }`}
                    >
                      {playingSample === sample.id ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="5" width="4" height="14" rx="1" />
                          <rect x="14" y="5" width="4" height="14" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[11px] font-semibold text-[#1B2A32]">
                        {playingSample === sample.id ? 'Playing Audio...' : 'Listen Original Dialect'}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[40, 75, 20, 90, 60, 30, 85, 45, 95, 35, 70, 50].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              playingSample === sample.id
                                ? 'bg-[#D46B28] animate-pulse'
                                : 'bg-[#D5CEBC]'
                            }`}
                            style={{ height: `${h * 0.16}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <blockquote className="text-xs italic text-[#253942] mb-3 leading-relaxed">
                    {sample.audioText}
                  </blockquote>

                  <p className="text-xs text-[#5D7079] leading-relaxed border-t border-[#EAE5D7] pt-3">
                    <span className="font-semibold text-[#1B2A32]">Normalized Meaning:</span> {sample.translation}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EAE5D7] flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2C4049]">{sample.sector}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#FCEFEB] text-[#8A3A2C]">
                    {sample.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD SPATIAL PREVIEW */}
      <section className="py-20 border-b border-[#E3DECE] bg-[#FAF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#112026] text-[#F3F0E6] rounded-3xl p-8 sm:p-12 shadow-xl overflow-hidden relative">
            {/* Top row */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#1A6F62]/30 border border-[#1A6F62] px-3 py-1 rounded-full text-xs font-mono font-bold text-[#44BBAA] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#44BBAA] animate-ping" />
                  DEVELOPMENT INTELLIGENCE ATLAS · PAN-INDIA
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Where Are Communities Asking For Change?
                </h2>
                <p className="text-sm text-[#A0B3BC] mt-1 max-w-xl">
                  Spatial hotspots mapped across high-priority districts. Filter by sector, baseline deficit, and seasonal flooding vulnerabilities.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="px-5 py-3 bg-[#D46B28] hover:bg-[#BF5C1F] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>Open Interactive Map</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Quick Hotspot Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {HOTSPOTS.slice(0, 3).map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => onNavigate(spot.id === 'nadia' ? '/dashboard/region/nadia' : '/dashboard')}
                  className="bg-white/5 border border-white/10 hover:border-[#1A6F62] p-5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#D46B28]">{spot.state}</span>
                      <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-white">
                        Gap: {spot.gapScore}/100
                      </span>
                    </div>
                    <div className="text-base font-bold text-white">{spot.name}</div>
                    <div className="text-xs text-[#9BB1BC] font-mono mt-0.5">{spot.sector}</div>
                    <p className="text-xs text-[#B8C8D0] mt-3 line-clamp-2 leading-relaxed">
                      {spot.primaryIssue}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#9BB1BC]">
                    <span>{spot.citizenRequests.toLocaleString()} requests</span>
                    <span className="text-[#44BBAA] font-bold">Inspect Basin →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deep-dive Link */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-[#899DA7]">
              <div>
                Featured Case Study: <span className="text-white font-bold">Nadia Basin Culvert & Rural Road Connectivity</span>
              </div>
              <button
                onClick={() => onNavigate('/dashboard/region/nadia')}
                className="text-[#D46B28] font-bold hover:underline"
              >
                Launch Nadia Impact Simulator (Screen 5) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPACT SIMULATOR PREVIEW */}
      <section className="py-20 border-b border-[#E3DECE] bg-[#FAF8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#D46B28] tracking-widest uppercase font-mono">
                Screen 5 Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112026] tracking-tight">
                Simulate Candidate Interventions Before Spending a Rupee
              </h2>
              <p className="text-base text-[#50636D] leading-relaxed">
                Baat2Badlav lets policy planners test multiple intervention scenarios. Compare road widening against flood-culvert installation, estimate capital requirements, and model development gap reductions before commissioning Detailed Project Reports (DPR).
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A6F62]/10 text-[#1A6F62] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1B2A32]">Before vs After Modeled Projections</span>
                    <p className="text-xs text-[#5A6E78]">Interactive meters showcasing gap drops from 74/100 down to 22/100.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A6F62]/10 text-[#1A6F62] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1B2A32]">Cost & Phasing Estimations</span>
                    <p className="text-xs text-[#5A6E78]">Benchmark estimates grounded in standard Schedule of Rates (SOR).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A6F62]/10 text-[#1A6F62] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1B2A32]">Multi-Option Tradeoff Tables</span>
                    <p className="text-xs text-[#5A6E78]">Side-by-side comparison across capital cost, execution risk, and seasonal resilience.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/dashboard/region/nadia')}
                  className="px-6 py-3.5 bg-[#1B2A32] hover:bg-[#2A3F4B] text-white text-sm font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Simulator for Nadia District</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Visual Card Mock */}
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE5D7]">
                <div className="text-xs font-mono font-bold text-[#1A6F62]">
                  SIMULATED SCENARIO A: CULVERTS + ELEVATED ROAD
                </div>
                <div className="text-xs font-mono font-bold bg-[#E6F2EE] text-[#1A6F62] px-2.5 py-1 rounded-full">
                  -52 Pts Gap Drop
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#E4DFD0]">
                  <div className="text-[11px] font-mono text-[#6A7E88]">CURRENT BASELINE</div>
                  <div className="text-3xl font-black text-[#8A3A2C] mt-1 font-mono">74/100</div>
                  <div className="text-xs text-[#8A3A2C] font-semibold mt-0.5">Critical Deficit</div>
                  <div className="text-[11px] text-[#6A7E88] mt-2">Flooding every monsoon</div>
                </div>
                <div className="bg-[#EBF7F2] p-4 rounded-xl border border-[#C5E5D8]">
                  <div className="text-[11px] font-mono text-[#1A6F62]">POST-INTERVENTION</div>
                  <div className="text-3xl font-black text-[#1A6F62] mt-1 font-mono">22/100</div>
                  <div className="text-xs text-[#1A6F62] font-semibold mt-0.5">High Resilience</div>
                  <div className="text-[11px] text-[#2C6250] mt-2">Year-round all-weather</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F0EBE0]">
                  <span className="text-[#556972]">Beneficiary Population:</span>
                  <span className="font-bold text-[#1B2A32]">34,200 residents</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0EBE0]">
                  <span className="text-[#556972]">Estimated Investment:</span>
                  <span className="font-bold text-[#1B2A32]">₹4.20 Crore</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0EBE0]">
                  <span className="text-[#556972]">Implementation Timeline:</span>
                  <span className="font-bold text-[#1B2A32]">8-10 Months</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#556972]">Primary Scheme Alignment:</span>
                  <span className="font-bold text-[#1A6F62]">PMGSY-III & State RIDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RESPONSIBLE AI & TRUST CENTER PREVIEW */}
      <section className="py-20 border-b border-[#E3DECE] bg-[#F5EFE0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E3DECE] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#EAEFF5] text-[#265366] text-xs font-mono font-bold px-3 py-1 rounded-full">
                <span>🛡️</span>
                <span>TRUST & RESPONSIBILITY GUARANTEE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112026]">
                Built for Public Scrutiny, Guarded Against Misuse
              </h2>
              <p className="text-sm text-[#50636D] leading-relaxed">
                Baat2Badlav is committed to constitutional privacy, zero political profiling, open data formulas, and strict human decision boundaries. Review our 5 core governance pillars and open methodologies.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-[#29424E] pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A6F62]"></span> Zero PII Retention
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A6F62]"></span> No Automated Fund Allocations
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A6F62]"></span> Open Composite Gap Formula
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('/trust')}
                className="px-6 py-3.5 bg-[#1B2A32] hover:bg-[#2A3F4B] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Open Trust & Data Center
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-20 text-center bg-[#FAF7EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-black text-[#112026] tracking-tight">
            Ready to Transform Civic Voices Into Real Change?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#556973] max-w-2xl mx-auto">
            Whether you are a citizen sharing a local community struggle or a civic administrator planning infrastructure investments, Baat2Badlav provides the evidence bridge.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/citizen')}
              className="w-full sm:w-auto px-8 py-4 bg-[#D46B28] hover:bg-[#BF5C1F] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Submit a Citizen Voice</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#D5CEBC] hover:bg-[#F2EDE0] text-[#1B2A32] text-base font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View National Dashboard</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
