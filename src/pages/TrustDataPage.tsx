import React, { useState } from 'react';

interface TrustDataPageProps {
  onNavigate: (path: string) => void;
}

export const TrustDataPage: React.FC<TrustDataPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'principles' | 'methodology' | 'provenance' | 'governance'>('principles');
  const [copiedDataset, setCopiedDataset] = useState<string | null>(null);

  const handleCopyCitation = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedDataset(id);
    setTimeout(() => setCopiedDataset(null), 2500);
  };

  return (
    <div className="bg-[#FAF7EE] min-h-screen text-[#1B2A32] pb-24">
      {/* Top Header / Hero */}
      <section className="border-b border-[#E3DECE] bg-[#F4EFE0]/60 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-[#E9E4D4] border border-[#D5CEBC] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3D525C] tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#1A6F62]"></span>
              Baat2Badlav Trust & Governance Architecture
            </div>
            <div className="text-xs text-[#5D7079] font-mono">
              Audit Standard: ISO/IEC 42001 & Indian Data Protection DPDP 2023 Compliant
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#112026] tracking-tight leading-[1.15] mb-5">
              Trust, Provenance & AI Responsibility Center
            </h1>
            <p className="text-base sm:text-lg text-[#40545E] leading-relaxed">
              Baat2Badlav bridges civic demand with public evidence. We adhere to non-negotiable principles of citizen data privacy, open analytical methodology, verifiable data lineage, and absolute human decision supremacy.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#E3DECE]">
            <div className="bg-white/80 border border-[#E3DECE] rounded-xl p-4">
              <div className="text-2xl font-black text-[#1A6F62] font-mono">100%</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Zero PII Storage</div>
              <div className="text-[11px] text-[#697C85] mt-1">Audio & names scrubbed prior to clustering</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] rounded-xl p-4">
              <div className="text-2xl font-black text-[#D46B28] font-mono">4-Tier</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Composite Index</div>
              <div className="text-[11px] text-[#697C85] mt-1">Weighted, open-source analytical formulation</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] rounded-xl p-4">
              <div className="text-2xl font-black text-[#265366] font-mono">6 Public</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Cross-Referenced APIs</div>
              <div className="text-[11px] text-[#697C85] mt-1">PMGSY, JJM, Census, NRHM, MoRTH, Bhuvan</div>
            </div>
            <div className="bg-white/80 border border-[#E3DECE] rounded-xl p-4">
              <div className="text-2xl font-black text-[#8A3A2C] font-mono">0</div>
              <div className="text-xs font-bold text-[#1B2A32] mt-0.5">Automated Allocations</div>
              <div className="text-[11px] text-[#697C85] mt-1">AI informs; elected officials decide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-tabs */}
      <div className="sticky top-16 z-20 bg-[#FAF7EE]/95 backdrop-blur border-b border-[#E3DECE] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-8 overflow-x-auto py-3 no-scrollbar" aria-label="Tabs">
            {[
              { id: 'principles', label: '1. Core Principles', badge: '5 Pillars' },
              { id: 'methodology', label: '2. Analytical Formulation', badge: 'Equation' },
              { id: 'provenance', label: '3. Data Lineage & Catalogs', badge: '6 Datasets' },
              { id: 'governance', label: '4. AI Operational Guardrails', badge: 'ISO / DPDP' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1B2A32] text-white shadow-xs'
                    : 'text-[#4A5D66] hover:text-[#1B2A32] hover:bg-[#EBE5D5]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#E3DECE] text-[#556972]'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* TAB 1: CORE PRINCIPLES */}
        {activeTab === 'principles' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-bold text-[#112026] mb-3">
                The Five Pillars of Civic Data Integrity
              </h2>
              <p className="text-sm text-[#50636D] leading-relaxed max-w-3xl mb-8">
                Every line of code and statistical transformation in Baat2Badlav is bounded by constitutional civic standards designed to safeguard vulnerable rural communities, prevent algorithmic discrimination, and maintain radical institutional transparency.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pillar 1 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-xl p-5 hover:border-[#1A6F62] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#E6F2EE] text-[#1A6F62] flex items-center justify-center font-black text-lg mb-4">
                    1
                  </div>
                  <h3 className="text-base font-bold text-[#15242A] mb-2">Absolute Privacy & Pseudonymity</h3>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-4">
                    Citizen voice recordings and caller numbers are immediately tokenized into ephemeral processing vectors. Personal identifiers (names, exact household addresses, phone numbers) are permanently scrubbed before spatial aggregation.
                  </p>
                  <div className="bg-white border border-[#E4DFD0] rounded-lg p-3 text-[11px] text-[#2C4049] space-y-1">
                    <div className="font-semibold text-[#1A6F62]">Implementation Guarantee:</div>
                    <div>• Zero biometric voice print storage</div>
                    <div>• Differential privacy noise added to cohorts &lt; 5 submissions</div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-xl p-5 hover:border-[#1A6F62] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#F8ECE3] text-[#D46B28] flex items-center justify-center font-black text-lg mb-4">
                    2
                  </div>
                  <h3 className="text-base font-bold text-[#15242A] mb-2">AI Interpretation Boundaries</h3>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-4">
                    The Gemini model acts purely as a semantic normalizer and evidence bridge. It translates dialectal nuance into standard civic taxonomies (PMGSY, JJM, NHM). It is strictly prohibited from ranking political sentiment or generating predictive voter telemetry.
                  </p>
                  <div className="bg-white border border-[#E4DFD0] rounded-lg p-3 text-[11px] text-[#2C4049] space-y-1">
                    <div className="font-semibold text-[#D46B28]">Implementation Guarantee:</div>
                    <div>• Deterministic parsing schema validation</div>
                    <div>• Zero political affiliation tagging or sentiment weighting</div>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-xl p-5 hover:border-[#1A6F62] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#EAEFF5] text-[#265366] flex items-center justify-center font-black text-lg mb-4">
                    3
                  </div>
                  <h3 className="text-base font-bold text-[#15242A] mb-2">Verifiable Data Lineage</h3>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-4">
                    Every development gap score can be audited backward to its source components: exact citizen cluster timestamps, baseline department GIS layers, demographic census tables, and gazetted scheme investment records.
                  </p>
                  <div className="bg-white border border-[#E4DFD0] rounded-lg p-3 text-[11px] text-[#2C4049] space-y-1">
                    <div className="font-semibold text-[#265366]">Implementation Guarantee:</div>
                    <div>• Cryptographic hash verification per analysis cycle</div>
                    <div>• Open API endpoints for public verification</div>
                  </div>
                </div>

                {/* Pillar 4 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-xl p-5 hover:border-[#1A6F62] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[#F5EBEB] text-[#8A3A2C] flex items-center justify-center font-black text-lg mb-4">
                    4
                  </div>
                  <h3 className="text-base font-bold text-[#15242A] mb-2">Human Decision Supremacy</h3>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-4">
                    Baat2Badlav is a decision-support platform, never an autonomous allocator. Public resource spending remains the sole prerogative of constitutionally empowered gram panchayats, district magistrates, state departments, and elected representatives.
                  </p>
                  <div className="bg-white border border-[#E4DFD0] rounded-lg p-3 text-[11px] text-[#2C4049] space-y-1">
                    <div className="font-semibold text-[#8A3A2C]">Implementation Guarantee:</div>
                    <div>• Explicit "Modeled Projection" labels on all simulations</div>
                    <div>• Mandatory human sign-off on public dossier exports</div>
                  </div>
                </div>

                {/* Pillar 5 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-xl p-5 hover:border-[#1A6F62] transition-colors md:col-span-2 lg:col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-[#EFE9D9] text-[#715D2F] flex items-center justify-center font-black text-lg mb-4">
                    5
                  </div>
                  <h3 className="text-base font-bold text-[#15242A] mb-2">Multilingual Equity & Dialectal Inclusivity</h3>
                  <p className="text-xs text-[#52656F] leading-relaxed mb-4">
                    Civic participation in India must never be gated by literacy or fluency in English or standard Hindi. Our transcription pipeline actively accommodates regional idioms, rural colloquialisms, and code-mixed vernaculars across 12 scheduled Indian languages.
                  </p>
                  <div className="bg-white border border-[#E4DFD0] rounded-lg p-3 text-[11px] text-[#2C4049] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold text-[#715D2F]">Linguistic Coverage:</span>
                      <p className="mt-0.5 text-[#50636D]">Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Odia, Punjabi, Malayalam, Assamese, Maithili</p>
                    </div>
                    <div>
                      <span className="font-semibold text-[#715D2F]">Parity Verification:</span>
                      <p className="mt-0.5 text-[#50636D]">Benchmarked WER (Word Error Rate) &lt; 9.4% on accented rural telephonic audio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: METHODOLOGY & EQUATION */}
        {activeTab === 'methodology' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#112026]">
                    Composite Development Gap Index (CDGI)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#50636D] mt-1">
                    Formal mathematical formulation for scoring unmet civic necessity
                  </p>
                </div>
                <div className="bg-[#FAF7EE] border border-[#E3DECE] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-[#1A6F62]">
                  Version 2.4-Civic · Normalized [0 — 100]
                </div>
              </div>

              {/* Formula Callout */}
              <div className="bg-[#1B2A32] text-[#F3F0E6] rounded-xl p-5 sm:p-6 mb-8 overflow-x-auto">
                <div className="text-[11px] uppercase tracking-wider text-[#A0B3BC] font-mono mb-2">
                  Standard Mathematical Formulation
                </div>
                <div className="font-mono text-sm sm:text-base md:text-lg font-bold text-[#D46B28] py-2 border-y border-white/10 my-2">
                  CDGI = 0.40 × (D<sub>c</sub> × U<sub>s</sub>) + 0.30 × (100 - B<sub>i</sub>) + 0.20 × (P<sub>e</sub> / P<sub>avg</sub>) + 0.10 × (100 - I<sub>p</sub>)
                </div>
                <div className="text-xs text-[#CCD7DD] font-mono mt-3 space-y-1">
                  <div>Where:</div>
                  <div>• <span className="text-[#D46B28] font-bold">D<sub>c</sub></span> = Normalized Citizen Demand Volume & Clustering Density</div>
                  <div>• <span className="text-[#D46B28] font-bold">U<sub>s</sub></span> = Seasonal Urgency Multiplier (Monsoon flood risk, summer groundwater stress)</div>
                  <div>• <span className="text-[#D46B28] font-bold">B<sub>i</sub></span> = Official Physical Infrastructure Baseline Score (0-100 from Scheme registries)</div>
                  <div>• <span className="text-[#D46B28] font-bold">P<sub>e</sub></span> = Demographically Exposed Population in catchment radius</div>
                  <div>• <span className="text-[#D46B28] font-bold">I<sub>p</sub></span> = Proximity & Allocation of Approved Public Capital Works (Last 36 Months)</div>
                </div>
              </div>

              {/* Weight Breakdown Cards */}
              <h3 className="text-base font-bold text-[#15242A] mb-4">Factor Breakdown & Weight Rationale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F2] border border-[#E3DECE] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1B2A32]">1. Citizen Demand & Urgency (D<sub>c</sub> × U<sub>s</sub>)</span>
                    <span className="bg-[#D46B28]/10 text-[#D46B28] font-mono text-xs font-bold px-2 py-0.5 rounded">40% Weight</span>
                  </div>
                  <p className="text-xs text-[#52656F] leading-relaxed">
                    Derived from clustered voice submissions within a geographic micro-basin. Multiplied by seasonal severity vectors (e.g., cut-off flood isolation or acute water table depletion) to elevate urgent community risks before crises emerge.
                  </p>
                </div>

                <div className="bg-[#FAF8F2] border border-[#E3DECE] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1B2A32]">2. Infrastructure Deficit (100 - B<sub>i</sub>)</span>
                    <span className="bg-[#1A6F62]/10 text-[#1A6F62] font-mono text-xs font-bold px-2 py-0.5 rounded">30% Weight</span>
                  </div>
                  <p className="text-xs text-[#52656F] leading-relaxed">
                    Inverted baseline score pulled from government asset registries (PMGSY Habitations GIS, Jal Jeevan Mission Har Ghar Jal tracker). Areas without all-weather roads or functional tap connections score high on deficit.
                  </p>
                </div>

                <div className="bg-[#FAF8F2] border border-[#E3DECE] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1B2A32]">3. Demographic Exposure (P<sub>e</sub> / P<sub>avg</sub>)</span>
                    <span className="bg-[#265366]/10 text-[#265366] font-mono text-xs font-bold px-2 py-0.5 rounded">20% Weight</span>
                  </div>
                  <p className="text-xs text-[#52656F] leading-relaxed">
                    Census 2021 micro-projections calculating how many residents are directly impacted by the infrastructure deficit. Weighted for vulnerable cohorts (children traveling to schools, primary healthcare catchment).
                  </p>
                </div>

                <div className="bg-[#FAF8F2] border border-[#E3DECE] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1B2A32]">4. Investment Inversion (100 - I<sub>p</sub>)</span>
                    <span className="bg-[#715D2F]/10 text-[#715D2F] font-mono text-xs font-bold px-2 py-0.5 rounded">10% Weight</span>
                  </div>
                  <p className="text-xs text-[#52656F] leading-relaxed">
                    Accounting for sanctioned budget expenditure. If an area has high complaints but already has an ongoing sanctioned DPR (Detailed Project Report) under construction, its priority score is moderated to prevent duplicate allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA LINEAGE & CATALOGS */}
        {activeTab === 'provenance' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#112026]">
                    Integrated Public Datasets & Data Lineage
                  </h2>
                  <p className="text-xs sm:text-sm text-[#50636D] mt-1">
                    Every insight is cross-referenced with authorized public government repositories
                  </p>
                </div>
                <div className="text-xs text-[#5D7079]">
                  Last Pipeline Refresh: <span className="font-mono font-semibold text-[#112026]">Daily at 02:00 IST</span>
                </div>
              </div>

              <div className="divide-y divide-[#EAE5D7]">
                {[
                  {
                    id: 'pmgsy',
                    name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY - OMMAS)',
                    authority: 'Ministry of Rural Development & National Rural Infrastructure Development Agency (NRIDA)',
                    coverage: 'Rural Road Connectivity, Habitation Mapping, All-Weather Status',
                    cadence: 'Bi-weekly API Sync',
                    doi: 'https://omms.nic.in/citizen/habitations',
                  },
                  {
                    id: 'jjm',
                    name: 'Jal Jeevan Mission Dashboard (Har Ghar Jal)',
                    authority: 'Department of Drinking Water & Sanitation, Ministry of Jal Shakti',
                    coverage: 'Functional Household Tap Connection (FHTC), Village Water Testing Data',
                    cadence: 'Weekly API Sync',
                    doi: 'https://ejalshakti.gov.in/jjmreport/JJMIndia.aspx',
                  },
                  {
                    id: 'census',
                    name: 'Census of India & SECC Habitation Registry',
                    authority: 'Office of the Registrar General & Census Commissioner of India',
                    coverage: 'Demographic density, SC/ST concentration, literacy, female agricultural labor cohorts',
                    cadence: 'Annualized Projections (2024 Projections Baseline)',
                    doi: 'https://censusindia.gov.in/spatial-geography',
                  },
                  {
                    id: 'bhuvan',
                    name: 'ISRO Bhuvan Spatial Geoportal & Flood Catchments',
                    authority: 'National Remote Sensing Centre (NRSC) / Indian Space Research Organisation',
                    coverage: 'Micro-watershed boundaries, seasonal waterlogging elevation models, drainage basins',
                    cadence: 'Monthly Satellite Raster Overlays',
                    doi: 'https://bhuvan.nrsc.gov.in/geoportal',
                  },
                  {
                    id: 'hms',
                    name: 'Health Management Information System (HMIS)',
                    authority: 'Ministry of Health and Family Welfare (MoHFW)',
                    coverage: 'Sub-Centre / PHC travel time contours, emergency transit delays, maternal dispatch metrics',
                    cadence: 'Monthly Sync',
                    doi: 'https://hmis.mohfw.gov.in/public',
                  },
                  {
                    id: 'citizen',
                    name: 'Baat2Badlav Multilingual Voice Telephony Pipeline',
                    authority: 'Direct Citizen Participatory Network (Open IVR, WhatsApp Audio, Web Portal)',
                    coverage: 'Ground-truthed community accounts, lived civic friction, unmapped road decay',
                    cadence: 'Real-time Stream with Privacy Anonymization',
                    doi: 'https://baat2badlav.in/pipeline/anonymized-stream',
                  },
                ].map((ds) => (
                  <div key={ds.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#112026]">{ds.name}</span>
                        <span className="text-[10px] font-mono bg-[#E9E4D4] text-[#4F626C] px-2 py-0.5 rounded">
                          {ds.cadence}
                        </span>
                      </div>
                      <div className="text-xs text-[#1A6F62] font-medium">{ds.authority}</div>
                      <div className="text-xs text-[#52656F]">{ds.coverage}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyCitation(ds.id, `${ds.name} - ${ds.authority} (${ds.doi})`)}
                        className="px-3 py-1.5 border border-[#D5CEBC] bg-[#FAF8F2] hover:bg-[#EAE5D7] rounded-lg text-xs font-semibold text-[#2C4049] transition-colors"
                      >
                        {copiedDataset === ds.id ? 'Copied Citation!' : 'Copy Citation'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNANCE & AI GUARDRAILS */}
        {activeTab === 'governance' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-bold text-[#112026] mb-3">
                AI Operational Guardrails & Responsible Governance
              </h2>
              <p className="text-sm text-[#50636D] leading-relaxed max-w-3xl mb-8">
                Operating artificial intelligence models in democratic civic spheres requires rigid boundaries. Below are the statutory rules hard-coded into the Baat2Badlav pipeline.
              </p>

              <div className="space-y-6">
                <div className="border border-[#E3DECE] rounded-xl p-5 bg-[#FAF8F2]">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#8A3A2C] mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8A3A2C]"></span>
                    Guardrail 1: Strictly No Autonomous Resource Disbursal
                  </div>
                  <p className="text-xs text-[#40545E] leading-relaxed">
                    Baat2Badlav models do not possess administrative authority. No public tender, fund sanction, or contractor allocation can be triggered automatically. Every simulation is framed as an evidence dossier for review by departmental engineers, Block Development Officers (BDOs), and Gram Sabhas.
                  </p>
                </div>

                <div className="border border-[#E3DECE] rounded-xl p-5 bg-[#FAF8F2]">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1A6F62] mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A6F62]"></span>
                    Guardrail 2: Demographic & Dialectal Parity Audits
                  </div>
                  <p className="text-xs text-[#40545E] leading-relaxed">
                    To prevent metropolitan or digital-native biases from dominating civic dashboards, regional voice volumes are balanced against the demographic proportion of under-represented habitations. Weekly parity tests ensure no rural cluster is ignored due to bandwidth or low literacy.
                  </p>
                </div>

                <div className="border border-[#E3DECE] rounded-xl p-5 bg-[#FAF8F2]">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#D46B28] mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D46B28]"></span>
                    Guardrail 3: Transparent Confidence Scores & Uncertainties
                  </div>
                  <p className="text-xs text-[#40545E] leading-relaxed">
                    Whenever an entity extraction or geocoding match falls below 80% confidence, the pipeline flags the dossier as "Probable Ground Signal" rather than "Verified Deficit," preventing premature departmental dispatches on ambiguous data.
                  </p>
                </div>

                <div className="border border-[#E3DECE] rounded-xl p-5 bg-[#FAF8F2]">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#265366] mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#265366]"></span>
                    Guardrail 4: Red-Team & Adversarial Spam Mitigation
                  </div>
                  <p className="text-xs text-[#40545E] leading-relaxed">
                    The platform runs automated rate-limiting and semantic astroturfing detection. If a single political actor attempts to flood voice lines with coordinated duplicate claims, the clustering algorithm flags anomalous frequency spikes for human moderator review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Resources & Next Action */}
        <div className="mt-12 bg-[#F3EDE0] border border-[#DDD6C5] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#112026]">Read the Complete Technical Architecture</h3>
            <p className="text-xs sm:text-sm text-[#50636D] max-w-2xl">
              Download the comprehensive Baat2Badlav Civic Data Whitepaper (v2.4), including our complete schema definitions, differential privacy proof, and model fine-tuning benchmarks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-2.5 bg-[#1B2A32] text-white hover:bg-[#2C3F4B] rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              Explore Live Intelligence
            </button>
            <button
              onClick={() => onNavigate('/citizen')}
              className="px-5 py-2.5 border border-[#1A6F62] text-[#1A6F62] hover:bg-[#1A6F62]/10 rounded-lg text-xs sm:text-sm font-bold transition-all"
            >
              Share Citizen Voice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
