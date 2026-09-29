import React, { useState } from 'react';
import { NADIA_INTERVENTIONS } from '../data/mockData';

interface RegionIntelligencePageProps {
  onNavigate: (path: string) => void;
}

export const RegionIntelligencePage: React.FC<RegionIntelligencePageProps> = ({ onNavigate }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('opt-1');
  const activeScenario = NADIA_INTERVENTIONS[selectedScenarioId];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <main className="w-full bg-[#f9f9fc] min-h-[calc(100vh-20rem)] text-[#1a1c1e] pb-16">
      {/* Top Dossier Meta Bar & Breadcrumbs */}
      <div className="w-full bg-[#f3f3f6]/70 py-2 border-b border-stone-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#444653] flex-wrap">
            <button onClick={() => onNavigate('/dashboard')} className="hover:underline cursor-pointer">
              Development Intelligence
            </button>
            <span className="text-[#c4c5d6] font-mono">/</span>
            <span>West Bengal</span>
            <span className="text-[#c4c5d6] font-mono">/</span>
            <span className="font-semibold text-[#1a1c1e]">Nadia</span>
            <span className="text-[#c4c5d6] font-mono">/</span>
            <span className="text-[#033aaf] font-semibold">Roads &amp; Mobility</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8e8ea] text-[#444653] text-[10px] font-mono">
              Nadia Basin Cluster · 17 GPs
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#004f49]/10 text-[#004f49] text-[10px] font-mono font-semibold">
              Updated · Q3 Demo Cycle
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
        
        {/* Section 1: Region Dossier Header */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="flex items-center gap-1.5 text-[#033aaf] text-[10px] font-mono tracking-wider uppercase font-bold">
              <span className="material-symbols-outlined text-[16px]">folder_supervised</span>
              <span>REGION INTELLIGENCE · GEOSPATIAL DOSSIER #WB-NAD-842</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 my-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1c1e] tracking-tight">
                Nadia · West Bengal
              </h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] text-[11px] font-mono font-bold">
                ● HIGH DEVELOPMENT GAP
              </span>
            </div>
            <p className="text-lg font-semibold text-[#444653]">
              Road Accessibility // Monsoon-Related Disruption
            </p>
            <p className="text-sm text-[#444653] mt-1 leading-relaxed">
              A concentrated citizen-demand signal associated with recurring monsoon road inundation and physical access severance across 17 contiguous Gram Panchayats.
            </p>
          </div>

          {/* Regional Context Summary Matrix */}
          <div className="flex flex-col justify-between bg-[#f3f3f6] rounded-xl p-5 min-w-[280px] border border-stone-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-[#033aaf]">17</span>
                <span className="text-[10px] font-mono text-[#444653] uppercase">Villages / GPs</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-[#1a1c1e]">72.4k</span>
                <span className="text-[10px] font-mono text-[#444653] uppercase">Exposed Pop</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-[#9e4200]">1,284</span>
                <span className="text-[10px] font-mono text-[#444653] uppercase">Citizen Reqs</span>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-stone-200 text-center">
              <span className="text-[11px] font-mono text-[#747685] block">
                Representative demonstration dataset · Configurable weights
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Development Gap Score & 6-Factor Decomposition */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Score Box */}
          <div className="lg:col-span-4 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#444653] font-bold">
                  Development Gap Score
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] font-bold">
                  RANGE 0–100
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-4">
                <span className="text-5xl sm:text-6xl font-extrabold text-[#1a1c1e] leading-none font-mono">
                  84
                </span>
                <span className="text-2xl font-mono text-[#ba1a1a] font-bold">/ 100</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffdad6] text-[#ba1a1a] text-xs font-mono font-bold w-fit">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                CRITICAL GAP LEVEL (Score ≥ 75)
              </div>
              <p className="text-xs text-[#444653] mt-4 leading-relaxed">
                Deterministic composite index synthesized from community demand, infrastructure deficit, demographic vulnerability, and public investment context.
              </p>
            </div>
            <div className="mt-6 pt-2 bg-[#f3f3f6] rounded p-2 border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] block text-center">
                Prototype methodology · Not official government statistics
              </span>
            </div>
          </div>

          {/* Right: Factor Decomposition Bars */}
          <div className="lg:col-span-8 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-[#1a1c1e]">Factor Decomposition</h2>
                <span className="text-xs text-[#444653]">Weight allocation applied to localized signal normalization</span>
              </div>
              <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold bg-[#dce1ff] px-2 py-0.5 rounded">
                Configurable Weights
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Factor 1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#1a1c1e]">
                    1. Citizen Demand <span className="text-[#444653] font-normal">(Weight: 30%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1e]">91 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#033aaf] h-2.5 rounded-full" style={{ width: '91%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  High concentration of verified voice submissions across 17 gram panchayats.
                </span>
              </div>

              {/* Factor 2 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#1a1c1e]">
                    2. Infrastructure Deficit <span className="text-[#444653] font-normal">(Weight: 25%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1e]">84 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#033aaf] h-2.5 rounded-full" style={{ width: '84%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  PMGSY all-weather road coverage 42% below district baseline.
                </span>
              </div>

              {/* Factor 3 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#1a1c1e]">
                    3. Population Exposure <span className="text-[#444653] font-normal">(Weight: 20%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1e]">78 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#2e54c7] h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  72,400 rural residents situated inside direct catchment severance area.
                </span>
              </div>

              {/* Factor 4 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#1a1c1e]">
                    4. Seasonal Urgency <span className="text-[#444653] font-normal">(Weight: 15%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1e]">82 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#9e4200] h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  Monsoon inundation cuts emergency maternal &amp; health clinic transit.
                </span>
              </div>

              {/* Factor 5 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#1a1c1e]">
                    5. Demographic Vulnerability <span className="text-[#444653] font-normal">(Weight: 10%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#1a1c1e]">64 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#fe843e] h-2.5 rounded-full" style={{ width: '64%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  Smallholder agricultural transport reliance and lack of secondary feeder spurs.
                </span>
              </div>

              {/* Factor 6 (Inverse Offset) */}
              <div className="bg-[#004f49]/5 p-3 rounded-lg border border-[#004f49]/15">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#004f49]">
                    6. Investment Coverage <span className="font-normal">(Inverse Offset Weight: 20%)</span>
                  </span>
                  <span className="font-mono font-bold text-[#004f49]">31 / 100</span>
                </div>
                <div className="w-full bg-[#e8e8ea] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#004f49] h-2.5 rounded-full" style={{ width: '31%' }}></div>
                </div>
                <span className="text-[11px] text-[#444653] block mt-0.5">
                  Higher investment coverage offsets the gap score; current coverage reveals significant funding divergence.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Formula Transparency Pipeline */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-1.5 text-[#033aaf] text-[10px] font-mono uppercase tracking-wider font-bold">
              <span className="material-symbols-outlined text-[16px]">functions</span>
              <span>DETERMINISTIC FORMULATION</span>
            </div>
            <h2 className="text-lg font-bold text-[#1a1c1e]">How the signal is calculated</h2>
          </div>

          <div className="bg-[#f3f3f6] rounded-lg p-4 font-mono text-xs overflow-x-auto text-[#1a1c1e] leading-loose border border-stone-200">
            <div className="flex flex-wrap items-center gap-1.5 min-w-[720px]">
              <span className="px-2 py-1 rounded bg-white text-[#033aaf] border border-stone-200">[Demand (91 × 0.30)]</span>
              <span>+</span>
              <span className="px-2 py-1 rounded bg-white text-[#033aaf] border border-stone-200">[Infra Deficit (84 × 0.25)]</span>
              <span>+</span>
              <span className="px-2 py-1 rounded bg-white text-[#2e54c7] border border-stone-200">[Exposure (78 × 0.20)]</span>
              <span>+</span>
              <span className="px-2 py-1 rounded bg-white text-[#9e4200] border border-stone-200">[Urgency (82 × 0.15)]</span>
              <span>+</span>
              <span className="px-2 py-1 rounded bg-white text-[#fe843e] border border-stone-200">[Vulnerability (64 × 0.10)]</span>
              <span>−</span>
              <span className="px-2 py-1 rounded bg-[#9cf2e8] text-[#00201d] font-bold">[Investment Coverage (31 × 0.20)]</span>
              <span>=</span>
              <span className="px-2.5 py-1 rounded bg-[#ba1a1a] text-white font-bold">
                Development Gap 84 (High)
              </span>
            </div>
          </div>
          <p className="text-xs text-[#444653] mt-2">
            Prototype weights are fully transparent, configurable, and intended for evidence-based human deliberation — not automated spending algorithms.
          </p>
        </section>

        {/* Section 4: Demand Profile & Spatial Triangulation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: What communities are saying */}
          <div className="lg:col-span-6 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Citizen Signal</span>
                  <h2 className="text-lg font-bold text-[#1a1c1e]">What communities are saying</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbcb] text-[#341100] text-[11px] font-mono font-bold">
                  1,284 Requests
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#444653] text-xs font-mono mb-4 pb-2 border-b border-stone-100">
                <span>Bengali: <strong>68%</strong></span>
                <span>Hindi: <strong>22%</strong></span>
                <span>English: <strong>10%</strong></span>
              </div>

              {/* Trend Chart (Monsoon Surge SVG) */}
              <div className="mb-4">
                <span className="text-[10px] font-mono text-[#444653] uppercase block mb-1">
                  Citizen Requests Over 12-Month Cycle
                </span>
                <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
                  <svg className="w-full h-24 stroke-[#033aaf] fill-none" preserveAspectRatio="none" viewBox="0 0 500 120">
                    <line stroke="#E5E5E2" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="500" y1="30" y2="30"></line>
                    <line stroke="#E5E5E2" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="500" y1="70" y2="70"></line>
                    <line stroke="#E5E5E2" strokeWidth="1" x1="0" x2="500" y1="110" y2="110"></line>

                    {/* Monsoon Surge Highlight */}
                    <rect fill="rgba(224, 109, 40, 0.08)" height="120" stroke="none" width="160" x="200" y="0"></rect>

                    {/* Trend Line */}
                    <path
                      d="M 0,105 Q 80,100 140,95 T 210,65 T 260,18 T 310,24 T 360,70 T 430,90 T 500,98"
                      fill="none"
                      stroke="#033aaf"
                      strokeWidth="2.5"
                    ></path>
                    <circle cx="260" cy="18" fill="#9e4200" r="4"></circle>
                    <circle cx="310" cy="24" fill="#9e4200" r="4"></circle>
                  </svg>
                  <div className="flex justify-between text-[10px] font-mono text-[#747685] mt-1 px-1">
                    <span>JAN</span>
                    <span>APR</span>
                    <span className="text-[#9e4200] font-bold">JUL (MONSOON PEAK)</span>
                    <span className="text-[#9e4200] font-bold">AUG</span>
                    <span>OCT</span>
                    <span>DEC</span>
                  </div>
                </div>
              </div>

              {/* Issue Tag Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                  Broken village culverts (41%)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                  Monsoon waterlogging (29%)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                  Sub-centre access cut off (18%)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                  Agricultural market transit severed (12%)
                </span>
              </div>

              {/* Verbatim Quotes */}
              <div className="p-3 rounded-lg bg-[#f3f3f6] text-[#1a1c1e] border border-stone-200">
                <p className="text-xs italic">
                  "বর্ষার সময় আমাদের পঞ্চায়েতের রাস্তা পুরো জলের তলায় চলে যায়, কোনো অ্যাম্বুলেন্স আসতে পারে না।"
                </p>
                <p className="text-xs text-[#444653] mt-1">
                  <span className="font-mono text-[#033aaf] font-bold">TRANSLATION (VERIFIED):</span> "During monsoon our GP road is fully submerged, no ambulance can enter."
                </p>
              </div>
            </div>
            <div className="mt-4 text-right">
              <span className="text-[10px] font-mono text-[#747685] uppercase">
                Aggregated via Baat2Badlav Citizen Line
              </span>
            </div>
          </div>

          {/* Right: Spatial Triangulation Map */}
          <div className="lg:col-span-6 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Spatial Triangulation</span>
                  <h2 className="text-lg font-bold text-[#1a1c1e]">Where the signal is concentrated</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f3f3f6] text-[#444653] text-[11px] font-mono border border-stone-200">
                  17 GP Contiguity
                </span>
              </div>

              {/* Cluster Map Vector */}
              <div className="bg-[#f3f3f6] rounded-xl p-4 relative overflow-hidden flex items-center justify-center border border-stone-200">
                <svg className="w-full h-56 max-w-md" viewBox="0 0 400 240">
                  {/* Cluster Boundary */}
                  <path
                    d="M 60,60 Q 150,20 280,50 T 360,130 T 290,210 T 110,190 T 50,110 Z"
                    fill="rgba(3, 58, 175, 0.04)"
                    stroke="#c4c5d6"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  ></path>
                  {/* Inundated Water Corridor */}
                  <path
                    d="M 40,40 Q 180,90 240,160 T 380,210"
                    fill="none"
                    opacity="0.6"
                    stroke="#90e6dc"
                    strokeLinecap="round"
                    strokeWidth="12"
                  ></path>
                  {/* Road Linkages (Broken) */}
                  <line stroke="#fe843e" strokeDasharray="4 2" strokeWidth="2.5" x1="90" x2="160" y1="80" y2="105"></line>
                  <line stroke="#ba1a1a" strokeWidth="3" x1="160" x2="225" y1="105" y2="120"></line>
                  <line stroke="#fe843e" strokeDasharray="4 2" strokeWidth="2.5" x1="225" x2="295" y1="120" y2="90"></line>
                  <line stroke="#ba1a1a" strokeWidth="3" x1="225" x2="250" y1="120" y2="170"></line>
                  <line stroke="#033aaf" strokeWidth="2" x1="160" x2="140" y1="105" y2="165"></line>

                  {/* GP Center Nodes */}
                  <g>
                    <circle cx="160" cy="105" fill="#033aaf" r="7"></circle>
                    <text className="font-mono text-[9px] fill-[#1a1c1e] font-bold" textAnchor="middle" x="160" y="95">
                      Chapra
                    </text>
                  </g>
                  <g>
                    <circle cx="225" cy="120" fill="#ba1a1a" r="10"></circle>
                    <circle className="animate-ping" cx="225" cy="120" fill="none" opacity="0.4" r="18" stroke="#ba1a1a" strokeWidth="1"></circle>
                    <text className="font-mono text-[9px] fill-[#ba1a1a] font-bold" textAnchor="middle" x="225" y="145">
                      Tehatta-II
                    </text>
                  </g>
                  <g>
                    <circle cx="295" cy="90" fill="#033aaf" r="6"></circle>
                    <text className="font-mono text-[9px] fill-[#1a1c1e] font-bold" textAnchor="middle" x="295" y="80">
                      Hanskhali
                    </text>
                  </g>
                  <g>
                    <circle cx="140" cy="165" fill="#033aaf" r="6"></circle>
                    <text className="font-mono text-[9px] fill-[#1a1c1e] font-bold" textAnchor="middle" x="140" y="180">
                      Krishnanagar-II
                    </text>
                  </g>
                  <g>
                    <circle cx="250" cy="170" fill="#9e4200" r="6"></circle>
                    <text className="font-mono text-[9px] fill-[#9e4200] font-bold" textAnchor="middle" x="250" y="190">
                      Betai Spur
                    </text>
                  </g>
                </svg>
              </div>

              <div className="mt-4 p-3 bg-[#f3f3f6] rounded-lg border border-stone-200">
                <p className="text-xs text-[#1a1c1e]">
                  <strong className="text-[#033aaf]">Geographic clustering verifies contiguous physical isolation</strong>{' '}
                  rather than isolated localized grievances. The 17 affected gram panchayats share the primary drainage basin of the Jalangi tributary.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-[#747685] text-[10px] font-mono">
              <span>Projection: WGS84 / UTM 45N</span>
              <span>Source: Survey of India + PMGSY GIS</span>
            </div>
          </div>
        </section>

        {/* Section 5: Multimodal Synthesis (Context Layers) */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Multimodal Synthesis</span>
            <h2 className="text-lg font-bold text-[#1a1c1e]">The signal becomes meaningful in context.</h2>
            <p className="text-xs text-[#444653]">
              Isolated citizen voices can be dismissed; triangulated with geospatial physical baselines and municipal accounts, they form institutional proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
            {/* Layer 1 */}
            <div className="bg-[#f3f3f6] p-4 rounded-xl flex flex-col justify-between h-40 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold">01 LAYER</span>
                <span className="text-xs font-mono font-bold text-[#033aaf]">91 / 100</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1e]">Citizen Demand</h3>
                <p className="text-xs text-[#444653] mt-1">1,284 verified requests across 17 contiguous GPs.</p>
              </div>
            </div>

            {/* Layer 2 */}
            <div className="bg-[#f3f3f6] p-4 rounded-xl flex flex-col justify-between h-40 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold">02 LAYER</span>
                <span className="text-xs font-mono font-bold text-[#ba1a1a]">28 / 100</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1e]">Physical Infra</h3>
                <p className="text-xs text-[#444653] mt-1">PMGSY all-weather road index 42% below baseline.</p>
              </div>
            </div>

            {/* Layer 3 */}
            <div className="bg-[#f3f3f6] p-4 rounded-xl flex flex-col justify-between h-40 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold">03 LAYER</span>
                <span className="text-xs font-mono font-bold text-[#9e4200]">78 / 100</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1e]">Population Exposure</h3>
                <p className="text-xs text-[#444653] mt-1">72,400 residents in direct monsoon severance catchment.</p>
              </div>
            </div>

            {/* Layer 4 */}
            <div className="bg-[#f3f3f6] p-4 rounded-xl flex flex-col justify-between h-40 border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#004f49] font-bold">04 LAYER</span>
                <span className="text-xs font-mono font-bold text-[#004f49]">31 / 100</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1c1e]">Public Investment</h3>
                <p className="text-xs text-[#444653] mt-1">Active tenders show zero planned culvert upgrades.</p>
              </div>
            </div>

            {/* Result Node */}
            <div className="bg-[#033aaf] p-4 rounded-xl flex flex-col justify-between h-40 text-white shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#b6c4ff] uppercase tracking-wider font-bold">RESULT NODE</span>
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-[#b6c4ff]">DEVELOPMENT GAP</span>
                <span className="text-4xl font-extrabold font-mono leading-none">84</span>
                <span className="text-xs font-bold block mt-1 text-white">HIGH CONFIDENCE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Gemini 1.5 Pro Explanation */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-l-4 border-[#033aaf] border-stone-200/80">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#033aaf] text-[20px]">smart_toy</span>
                <span className="text-base font-bold text-[#1a1c1e]">Gemini 1.5 Pro · Evidence-Based Interpretation</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#f3f3f6] text-[#444653] text-[10px] font-mono font-bold">
                AI EXPLANATION (Generated insight, not deterministic score)
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#1a1c1e] leading-relaxed">
              "Citizen demand is acutely concentrated across 17 contiguous Gram Panchayats around seasonal road washouts. When triangulated with ground infrastructure data, PMGSY all-weather connectivity is 42% below district baselines. With 72,400 residents exposed and minimal active capital outlays, this cluster represents a high-confidence structural development gap requiring human policy deliberation."
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[#004f49] text-xs font-mono font-semibold">
              <span>✓ Citizen demand validated</span>
              <span>✓ GIS infrastructure baseline matched</span>
              <span>✓ Census catchment intersected</span>
              <span>✓ State treasury register cross-referenced</span>
              <span>✓ Deterministic score audited</span>
            </div>
            <div className="pt-1">
              <span className="text-[11px] font-mono text-[#747685]">
                Note: AI explains the calculated evidence; it does not determine scores or allocate public funds.
              </span>
            </div>
          </div>
        </section>

        {/* Section 7: Candidate Interventions */}
        <section className="flex flex-col gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Policy Pathways</span>
            <h2 className="text-2xl font-bold text-[#1a1c1e]">What could address the gap?</h2>
            <p className="text-xs sm:text-sm text-[#444653]">
              Explore illustrative interventions and compare their modeled outcomes. (Neutral scenario options, not automated endorsements).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(NADIA_INTERVENTIONS).map((opt) => {
              const isSelected = selectedScenarioId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedScenarioId(opt.id)}
                  className={`cursor-pointer bg-white rounded-xl p-6 shadow-sm transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-[#033aaf] shadow-md ring-2 ring-[#033aaf]/10'
                      : 'border border-stone-200 hover:border-[#033aaf]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-[#dce1ff] text-[#033aaf]' : 'bg-[#f3f3f6] text-[#444653]'
                        }`}
                      >
                        {opt.id === 'opt-1' ? 'OPTION 01' : opt.id === 'opt-2' ? 'OPTION 02' : 'OPTION 03'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isSelected
                            ? 'bg-[#033aaf]/10 text-[#033aaf] font-bold'
                            : 'bg-stone-100 text-[#444653]'
                        }`}
                      >
                        {isSelected ? 'Simulating (Active)' : 'Alternative'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1a1c1e]">{opt.name}</h3>
                    <p className="text-xs text-[#444653] mt-1 leading-relaxed">{opt.description}</p>

                    <div className="mt-4 space-y-1.5 font-mono text-xs border-t border-stone-100 pt-3">
                      <div className="flex justify-between text-[#444653]">
                        <span>Potential Reach:</span>
                        <span className="font-bold text-[#1a1c1e]">{opt.potentialReach.toLocaleString()} people</span>
                      </div>
                      <div className="flex justify-between text-[#444653]">
                        <span>Projected Infra:</span>
                        <span className="font-bold text-[#033aaf]">{opt.projectedInfra.before} → {opt.projectedInfra.after}</span>
                      </div>
                      <div className="flex justify-between text-[#444653]">
                        <span>Modeled Gap Reduction:</span>
                        <span className="font-bold text-[#004f49]">{opt.gapReductionPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#033aaf] text-white shadow-2xs'
                        : 'bg-[#f3f3f6] text-[#1a1c1e] hover:bg-[#e8e8ea]'
                    }`}
                  >
                    {isSelected ? 'Selected Scenario' : 'Simulate Scenario'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 8: Centerpiece Impact Simulator */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#033aaf] text-[20px]">science</span>
                <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">
                  Interactive Modeling Engine
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1c1e] mt-1">
                IMPACT SIMULATOR: {activeScenario.name}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#f3f3f6] text-[#444653] font-mono text-[11px] border border-stone-200">
              Illustrative scenario · Not a funding recommendation
            </span>
          </div>

          {/* Before vs After Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch my-6">
            {/* Before (Baseline) */}
            <div className="lg:col-span-5 bg-[#f3f3f6] rounded-xl p-5 flex flex-col justify-between border border-stone-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-bold text-[#444653]">BASELINE SITUATION (CURRENT)</span>
                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] font-bold">
                  Unmitigated
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 my-2">
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Infra Index</span>
                  <span className="text-2xl font-mono font-bold text-[#1a1c1e]">31</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Affected Pop</span>
                  <span className="text-2xl font-mono font-bold text-[#1a1c1e]">72,400</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Unresolved Reqs</span>
                  <span className="text-2xl font-mono font-bold text-[#9e4200]">1,284</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">All-Weather Access</span>
                  <span className="text-2xl font-mono font-bold text-[#1a1c1e]">38%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-stone-200 flex justify-between items-center">
                <span className="text-xs font-mono text-[#444653] uppercase">Current Gap Score</span>
                <span className="text-lg font-mono font-bold text-[#ba1a1a]">84 / 100</span>
              </div>
            </div>

            {/* Delta Transition Indicator */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#dce1ff] flex items-center justify-center text-[#033aaf] mb-2 shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </div>
              <span className="text-xs font-bold text-[#033aaf] uppercase">{activeScenario.transformLabel}</span>
              <span className="text-[11px] font-mono text-[#747685] mt-0.5">{activeScenario.transformSub}</span>
            </div>

            {/* After (Modeled Projection) */}
            <div className="lg:col-span-5 bg-[#004f49]/5 rounded-xl p-5 flex flex-col justify-between border border-[#004f49]/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-bold text-[#004f49]">MODELED PROJECTION (AFTER)</span>
                <span className="px-2 py-0.5 rounded bg-[#9cf2e8] text-[#00201d] font-mono text-[10px] font-bold">
                  Simulated Outcome
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 my-2">
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Infra Index</span>
                  <span className="text-2xl font-mono font-bold text-[#004f49]">{activeScenario.projectedInfra.after}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Affected Pop</span>
                  <span className="text-2xl font-mono font-bold text-[#1a1c1e]">{activeScenario.afterPop.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">Unresolved Reqs</span>
                  <span className="text-2xl font-mono font-bold text-[#1a1c1e]">{activeScenario.afterReqs}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#747685] block uppercase">All-Weather Access</span>
                  <span className="text-2xl font-mono font-bold text-[#004f49]">{activeScenario.afterAccessPercent}%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#004f49]/20 flex justify-between items-center">
                <span className="text-xs font-mono text-[#004f49] uppercase font-bold">Projected Gap Score</span>
                <span className="text-lg font-mono font-bold text-[#004f49]">
                  {activeScenario.projectedGapScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Comparative Gap Meters */}
          <div className="bg-[#f3f3f6] rounded-xl p-5 my-4 border border-stone-200">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Current Gap</span>
                  <span className="font-mono text-[#ba1a1a] font-bold">84 / 100 (HIGH)</span>
                </div>
                <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-[#ba1a1a] h-3 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Modeled Scenario Gap</span>
                  <span className="font-mono text-[#004f49] font-bold">
                    {activeScenario.projectedGapScore} / 100 ({activeScenario.projectedGapScore <= 40 ? 'MODERATE' : 'MODERATE-HIGH'})
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#004f49] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${activeScenario.projectedGapScore}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#9cf2e8] text-[#00201d] font-bold font-mono">
                  {activeScenario.gapReductionPercent}% Modeled Gap Reduction
                </span>
                <span className="text-[#444653]">Calibrated against PMGSY tier-2 guidelines</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[#444653]">
                <span>Isolation Reduced: <strong className="text-[#1a1c1e]">{activeScenario.popReduced.toLocaleString()} people</strong></span>
                <span>Needs Addressed: <strong className="text-[#1a1c1e]">{activeScenario.reqsAddressed} requests</strong></span>
              </div>
            </div>
          </div>

          {/* Expandable Scenario Assumptions */}
          <details className="group bg-[#f3f3f6] rounded-lg p-3 text-[#1a1c1e] border border-stone-200">
            <summary className="cursor-pointer text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                View Modeling Parameters &amp; Assumptions
              </span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="mt-3 space-y-1.5 text-xs text-[#444653] pl-6 border-t border-stone-200 pt-2">
              <p>• Infrastructure lift calibrated against PMGSY Tier-2 rural specifications.</p>
              <p>• Primary catchment population directly connected to primary health centre within 20 mins.</p>
              <p>• Calculations assume unhindered dry-season construction window (November–May).</p>
              <p>• All figures represent synthetic demo projections for deliberation.</p>
            </div>
          </details>
        </section>

        {/* Section 9: Scenario Comparison Table */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Side-by-Side Analysis</span>
            <h2 className="text-lg font-bold text-[#1a1c1e]">Scenario Comparison Table</h2>
            <p className="text-xs text-[#444653]">
              Strictly objective comparative assessment. Baat2Badlav does not rank or label a "winner".
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[760px]">
              <thead className="bg-[#f3f3f6] text-[#444653] text-[10px] font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Intervention Name</th>
                  <th className="py-2.5 px-4">Population Reached</th>
                  <th className="py-2.5 px-4">Projected Infra</th>
                  <th className="py-2.5 px-4">Unresolved Demand Left</th>
                  <th className="py-2.5 px-4">Modeled Gap Reduction</th>
                  <th className="py-2.5 px-4 rounded-r-lg">Capital Intensity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[#1a1c1e]">
                {Object.values(NADIA_INTERVENTIONS).map((item) => {
                  const isActive = selectedScenarioId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedScenarioId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isActive ? 'bg-[#dce1ff]/30 font-semibold' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-[#033aaf]">
                        {item.name} {isActive ? '(Active)' : ''}
                      </td>
                      <td className="py-3 px-4 font-mono">{item.potentialReach.toLocaleString()} residents</td>
                      <td className="py-3 px-4 font-mono">{item.projectedInfra.before} → {item.projectedInfra.after}</td>
                      <td className="py-3 px-4 font-mono">{item.afterReqs} requests</td>
                      <td className="py-3 px-4 font-mono text-[#004f49] font-bold">{item.gapReductionPercent}%</td>
                      <td className="py-3 px-4 font-mono text-[#444653]">{item.capitalIntensity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 10: Human Decision Boundary & Provenance */}
        <section className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
          <div className="bg-[#f3f3f6] rounded-xl p-4 sm:p-5 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-200">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#9e4200] text-[24px]">gavel</span>
              <div>
                <h3 className="text-base font-bold text-[#1a1c1e]">Evidence, not automated policy.</h3>
                <p className="text-xs sm:text-sm text-[#444653] max-w-3xl mt-0.5 leading-relaxed">
                  Baat2Badlav identifies patterns, calculates transparent indicators, and models scenario outcomes. Final decisions regarding public fund allocations, project tenders, and civic priorities remain exclusively with elected representatives, planners, and community bodies.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded bg-[#ffdbcb] text-[#793100] text-xs font-mono font-semibold whitespace-nowrap">
              Constitutional Demarcation
            </span>
          </div>

          {/* Provenance Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-[#1a1c1e]">
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">Citizen Requests</span>
              <span className="text-xs font-bold block mt-1">Multilingual Voice &amp; Text</span>
              <span className="text-[10px] font-mono text-[#444653]">Synthetic demo dataset</span>
            </div>
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">Demographics</span>
              <span className="text-xs font-bold block mt-1">Census Catchment</span>
              <span className="text-[10px] font-mono text-[#444653]">Office of Registrar General</span>
            </div>
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">Infrastructure</span>
              <span className="text-xs font-bold block mt-1">PMGSY &amp; State PWD GIS</span>
              <span className="text-[10px] font-mono text-[#444653]">GIS spatial layer v2.4</span>
            </div>
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">Investment</span>
              <span className="text-xs font-bold block mt-1">PFMS Demo Registry</span>
              <span className="text-[10px] font-mono text-[#444653]">Tender &amp; sanctions tracking</span>
            </div>
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">AI Engine</span>
              <span className="text-xs font-bold block mt-1">Gemini 1.5 Pro</span>
              <span className="text-[10px] font-mono text-[#444653]">Explanation modality only</span>
            </div>
            <div className="bg-[#f3f3f6] p-3 rounded-lg border border-stone-200">
              <span className="text-[10px] font-mono text-[#747685] uppercase block">Calculation</span>
              <span className="text-xs font-bold block mt-1">Transparent Deterministic</span>
              <span className="text-[10px] font-mono text-[#444653]">No black-box scoring</span>
            </div>
          </div>
        </section>

        {/* Section 11: Persistent Action Bar */}
        <section className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#444653]">
            <span className="material-symbols-outlined text-[#747685] text-[18px]">verified_user</span>
            <span>Dossier verified for multi-stakeholder civil deliberation.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2.5 rounded-lg bg-[#f3f3f6] hover:bg-[#e8e8ea] text-[#1a1c1e] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-200"
            >
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              <span>Explore Another Region</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-lg bg-[#f3f3f6] hover:bg-[#e8e8ea] text-[#1a1c1e] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-stone-200"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export Deliberation Dossier (PDF)</span>
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-4 py-2.5 rounded-lg bg-[#033aaf] hover:bg-[#063baf] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
              <span>View All 84 Development Gaps</span>
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};
