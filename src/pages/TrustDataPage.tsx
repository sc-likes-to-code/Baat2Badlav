/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface TrustDataPageProps {
  onNavigate: (path: string) => void;
}

type TabType = 'model' | 'matrix' | 'lineage' | 'privacy' | 'limitations';

export const TrustDataPage: React.FC<TrustDataPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('model');
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  return (
    <div className="bg-[#FAF7EE] min-h-screen text-[#1B2A32] pb-24">
      {/* Top Header / Hero */}
      <section className="border-b border-[#E3DECE] bg-[#F4EFE0]/70 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-[#E9E4D4] border border-[#D5CEBC] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3D525C] tracking-wide uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              Baat2Badlav Transparency &amp; Responsible AI Layer
            </div>
            <div className="text-xs text-[#5D7079] font-mono">
              Platform Architecture · Update 10 Verified
            </div>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#112026] tracking-tight leading-[1.15] mb-4">
              Trust, Data Provenance &amp; AI Responsibility
            </h1>
            <p className="text-base sm:text-lg text-[#40545E] leading-relaxed">
              Baat2Badlav transforms multilingual citizen demand into explainable development intelligence. We adhere to non-negotiable principles of radical methodological transparency, privacy-by-design, auditable data lineages, and absolute human decision supremacy.
            </p>
          </div>

          {/* Standard Data Quality Badges Showcase */}
          <div className="mt-8 pt-6 border-t border-[#E3DECE]">
            <span className="text-[11px] font-mono uppercase text-stone-500 font-bold tracking-wider block mb-3">
              Standardized Platform Data Classifications:
            </span>
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-bold">
                ● Citizen Report (User-Provided)
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
                ● AI Interpretation (Gemini-Derived)
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold">
                ● Synthetic Demonstration Data
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                ● Deterministic Analysis (Pure Math)
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-bold">
                ● Hypothetical Simulation (Scenario Model)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-tabs */}
      <div className="sticky top-16 z-20 bg-[#FAF7EE]/95 backdrop-blur-md border-b border-[#E3DECE] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-3 no-scrollbar" aria-label="Tabs">
            {[
              { id: 'model', label: '1. Core Trust Model', badge: '5 Distinctions' },
              { id: 'matrix', label: '2. Real vs. Modeled Matrix', badge: '11 Layers' },
              { id: 'lineage', label: '3. Data Lineage & Traceability', badge: 'Audit Trail' },
              { id: 'privacy', label: '4. Privacy & AI Responsibility', badge: 'Governance' },
              { id: 'limitations', label: '5. Limitations & Future Readiness', badge: 'Guardrails' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#111315] text-white shadow-xs'
                    : 'text-[#4A5D66] hover:text-[#111315] hover:bg-[#EBE5D5]'
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
        
        {/* ================================================================= */}
        {/* TAB 1: CORE TRUST MODEL */}
        {/* ================================================================= */}
        {activeTab === 'model' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-3xl">
                <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                  Conceptual Architecture
                </span>
                <h2 className="text-2xl font-bold text-[#112026] mt-1">
                  The Five Core Distinctions of Baat2Badlav
                </h2>
                <p className="text-sm text-[#50636D] mt-2 leading-relaxed">
                  To prevent algorithmic over-claiming and build institutional credibility, Baat2Badlav explicitly enforces 5 fundamental epistemological distinctions across all user interfaces, scoring layers, and dossier reports.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {/* Distinction 1 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#033aaf] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-mono font-bold">
                        Distinction 01
                      </span>
                      <span className="material-symbols-outlined text-orange-700 text-xl">record_voice_over</span>
                    </div>
                    <h3 className="text-base font-bold text-[#15242A]">
                      Citizen Report ≠ Verified Fact
                    </h3>
                    <p className="text-xs text-[#52656F] leading-relaxed">
                      Information submitted by a community member represents <em>what was reported</em> by a citizen experiencing friction. It is vital subjective testimony, but it does not automatically constitute a legally or technically verified ground fact until triangulated.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4DFD0] text-[11px] text-[#2C4049] font-mono">
                    <strong>Rule:</strong> Displayed as community demand evidence, not as audited physical facts.
                  </div>
                </div>

                {/* Distinction 2 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#033aaf] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-mono font-bold">
                        Distinction 02
                      </span>
                      <span className="material-symbols-outlined text-indigo-700 text-xl">smart_toy</span>
                    </div>
                    <h3 className="text-base font-bold text-[#15242A]">
                      AI Interpretation ≠ Government Verification
                    </h3>
                    <p className="text-xs text-[#52656F] leading-relaxed">
                      Google Gemini structures, transliterates, and extracts civic entities (civic domain, primary issue, normalized summary, severity, urgency, extracted locations) from vernacular speech. It provides an <em>interpretation clarity score</em>, not a verification against official government records.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4DFD0] text-[11px] text-[#2C4049] font-mono">
                    <strong>Rule:</strong> AI normalizes language; it never validates or audits legal claims.
                  </div>
                </div>

                {/* Distinction 3 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#033aaf] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                        Distinction 03
                      </span>
                      <span className="material-symbols-outlined text-amber-800 text-xl">dataset</span>
                    </div>
                    <h3 className="text-base font-bold text-[#15242A]">
                      Synthetic Data ≠ Official Census / Registry
                    </h3>
                    <p className="text-xs text-[#52656F] leading-relaxed">
                      The prototype utilizes synthetic demonstration data for infrastructure baselines, demographic context, and investment indices to illustrate the platform&apos;s analytical pipeline. These exist to demonstrate the mathematical scoring architecture and are clearly disclosed as synthetic demonstration data.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4DFD0] text-[11px] text-[#2C4049] font-mono">
                    <strong>Rule:</strong> All demonstration baseline matrices carry synthetic demonstration labels.
                  </div>
                </div>

                {/* Distinction 4 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#033aaf] transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-mono font-bold">
                        Distinction 04
                      </span>
                      <span className="material-symbols-outlined text-blue-700 text-xl">calculate</span>
                    </div>
                    <h3 className="text-base font-bold text-[#15242A]">
                      Deterministic Analytics vs LLM Hallucination
                    </h3>
                    <p className="text-xs text-[#52656F] leading-relaxed">
                      Development Gap scoring [0.40 × Demand Signal + 0.30 × Infrastructure Need + 0.20 × Demographic Pressure + 0.10 × Investment Gap], Priority rankings, and Candidate Project assignments are computed via pure, deterministic TypeScript code. Gemini is never prompted to invent or guess downstream numerical scores.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4DFD0] text-[11px] text-[#2C4049] font-mono">
                    <strong>Rule:</strong> Same inputs strictly produce identical mathematical outputs every time.
                  </div>
                </div>

                {/* Distinction 5 */}
                <div className="bg-[#FAF8F2] border border-[#E7E2D3] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#033aaf] transition-colors md:col-span-2 lg:col-span-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-mono font-bold">
                        Distinction 05
                      </span>
                      <span className="material-symbols-outlined text-teal-700 text-xl">tune</span>
                    </div>
                    <h3 className="text-base font-bold text-[#15242A]">
                      Simulation ≠ Forecast ≠ Guarantee ≠ Measured Real-World Impact
                    </h3>
                    <p className="text-xs text-[#52656F] leading-relaxed">
                      The Impact Simulation Engine calculates <strong>hypothetical scenario estimates</strong> to illustrate how outcomes vary under different coverage and implementation effectiveness assumptions. It does not predict future real-world outcomes, nor does it guarantee engineering success. Furthermore, &ldquo;Effective Scenario Reach&rdquo; is a mathematical model parameter (Coverage × Effectiveness), not a census beneficiary headcount.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4DFD0] text-[11px] text-[#2C4049] font-mono">
                    <strong>Rule:</strong> Always described as &ldquo;Projected / Modeled Scenario Outcome,&rdquo; never as empirical truth.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: REAL VS MODELED REFERENCE MATRIX */}
        {/* ================================================================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-3xl">
                <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                  Auditability &amp; Provenance
                </span>
                <h2 className="text-2xl font-bold text-[#112026] mt-1">
                  What is Real vs. Modeled in the Prototype?
                </h2>
                <p className="text-sm text-[#50636D] mt-2 leading-relaxed">
                  A transparent breakdown of every platform layer, its underlying source of truth, and its analytical classification.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-200 bg-stone-50 font-mono text-[11px] text-stone-700">
                      <th className="py-3 px-4">Pipeline Layer</th>
                      <th className="py-3 px-4">Source of Truth</th>
                      <th className="py-3 px-4">Classification Badge</th>
                      <th className="py-3 px-4">Analytical Nature &amp; Operational Guarantee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">1. Citizen Voice Submissions</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">User / Community Input</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-mono font-bold">
                          Citizen Report
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Direct vernacular testimony submitted anonymously via text or voice.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">2. AI Interpretation</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Gemini 3.5 Flash Lite</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                          AI Interpretation
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Semantic extraction of civic domain, primary issue, normalized summary, entities/signals, severity, urgency, urgency reasoning, extracted locations, and interpretation confidence.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">3. Demand Clustering</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Clustering Service</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          Deterministic Analysis
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Keyword &amp; ontological thematic clustering across reports.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">4. Demand Hotspots</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Hotspot Derivation Engine</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          Deterministic Analysis
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Aggregates cluster volume, severity distributions, and locality tags by district.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">5. Infrastructure Context</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Synthetic Baseline Catalog</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                          Synthetic Demonstration Data
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Simulated sector access scores (road, water, health, electricity, school).
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">6. Demographic Context</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Synthetic Census Profiles</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                          Synthetic Demonstration Data
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Population density, rural shares, and seasonal vulnerability indices.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">7. Investment Index</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Synthetic Fiscal Profiles</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                          Synthetic Demonstration Data
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Simulated recent capital allocation by sector to prevent duplicate funding.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">8. Development Gap Engine</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Development Gap Service</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          Deterministic Analysis
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Exact formula: [0.40 × Demand Signal] + [0.30 × Infrastructure Need] + [0.20 × Demographic Pressure] + [0.10 × Investment Gap].
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">9. Priority Intelligence</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Priority Service</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          Deterministic Analysis
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        5-factor ranking: [0.30 × Demand Intensity] + [0.30 × Development Gap] + [0.15 × Urgency] + [0.15 × Geo Concentration] + [0.10 × Service Pressure].
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">10. Candidate Projects</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Project Service</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                          Deterministic Analysis
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Archetype translation mapping priority needs to concrete intervention options.
                      </td>
                    </tr>

                    <tr className="hover:bg-stone-50/60">
                      <td className="py-3.5 px-4 font-bold text-stone-900">11. Impact Simulation Engine</td>
                      <td className="py-3.5 px-4 font-mono text-[#52656F]">Impact Simulation Service</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-mono font-bold">
                          Hypothetical Simulation
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        Real-time recalculation of residual gaps under user-specified coverage &amp; effectiveness.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DATA LINEAGE & TRACEABILITY */}
        {/* ================================================================= */}
        {activeTab === 'lineage' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="max-w-3xl">
                <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                  Audit Chain of Custody
                </span>
                <h2 className="text-2xl font-bold text-[#112026] mt-1">
                  10-Stage Verifiable Data Lineage
                </h2>
                <p className="text-sm text-[#50636D] mt-2 leading-relaxed">
                  How a single rural voice note transforms into a simulated development scenario through an inspectable, unbroken chain of evidence.
                </p>
              </div>

              {/* Lineage Steps Visual List */}
              <div className="space-y-4 pt-2">
                {[
                  {
                    num: '01',
                    title: 'Citizen Voice Intake',
                    badge: 'Citizen Report',
                    badgeColor: 'bg-orange-100 text-orange-800',
                    desc: 'A rural resident in Chapra, Nadia speaks into the microphone in Bengali describing severe monsoon road inundation.',
                    foreignKey: 'ID: syn-rd-001',
                  },
                  {
                    num: '02',
                    title: 'Gemini AI Civic Normalization',
                    badge: 'AI Interpretation',
                    badgeColor: 'bg-indigo-100 text-indigo-800',
                    desc: 'Gemini transliterates audio, maps colloquial terms to "Roads & Mobility", classifies severity as "High", and scores interpretation clarity at 0.94.',
                    foreignKey: 'Parent: syn-rd-001',
                  },
                  {
                    num: '03',
                    title: 'Semantic Demand Clustering',
                    badge: 'Deterministic Analysis',
                    badgeColor: 'bg-blue-100 text-blue-800',
                    desc: 'Clustering service groups similar road inundation reports across the corridor into a unified demand statement.',
                    foreignKey: 'Cluster ID: cluster-roads-monsoon_connectivity',
                  },
                  {
                    num: '04',
                    title: 'Demand Hotspot Derivation',
                    badge: 'Deterministic Analysis',
                    badgeColor: 'bg-blue-100 text-blue-800',
                    desc: 'Hotspots aggregate report volume (6 reports in Nadia) and compute localized severity/urgency distributions.',
                    foreignKey: 'Hotspot ID: hotspot-wb-nadia-cluster-roads-...',
                  },
                  {
                    num: '05',
                    title: 'Contextual Baseline Fusion',
                    badge: 'Synthetic Demonstration Data',
                    badgeColor: 'bg-amber-100 text-amber-900',
                    desc: 'Overlays road accessibility (28%), demographic vulnerability (85% seasonal pressure), and recent capital investment (31%).',
                    foreignKey: 'District: nadia (West Bengal)',
                  },
                  {
                    num: '06',
                    title: 'Development Gap Engine',
                    badge: 'Deterministic Analysis',
                    badgeColor: 'bg-blue-100 text-blue-800',
                    desc: 'Deterministic formula calculates a composite Development Gap of 78/100 (Very High Gap).',
                    foreignKey: 'Gap ID: gap-hotspot-wb-nadia-...',
                  },
                  {
                    num: '07',
                    title: 'Priority Intelligence Engine',
                    badge: 'Deterministic Analysis',
                    badgeColor: 'bg-blue-100 text-blue-800',
                    desc: 'Synthesizes demand intensity, gap score, urgency, and geographic concentration into an 84/100 Critical Priority Signal.',
                    foreignKey: 'Priority ID: priority-gap-hotspot-...',
                  },
                  {
                    num: '08',
                    title: 'Candidate Project Generation',
                    badge: 'Deterministic Analysis',
                    badgeColor: 'bg-blue-100 text-blue-800',
                    desc: 'Maps the priority signal to the "Drainage Improvement" archetype: "Monsoon Drainage & Road Rehabilitation — Nadia".',
                    foreignKey: 'Project ID: proj-wb-nadia-monsoon-drainage',
                  },
                  {
                    num: '09',
                    title: 'Impact Simulation Engine',
                    badge: 'Hypothetical Simulation',
                    badgeColor: 'bg-teal-100 text-teal-800',
                    desc: 'Under a Balanced scenario (60% coverage, 75% effectiveness), projects a 20.1 pt gap reduction (residual gap: 57.9/100).',
                    foreignKey: 'Scenario Ref: sim-proj-wb-nadia-60-75',
                  },
                  {
                    num: '10',
                    title: 'Decision Support Dashboard',
                    badge: 'Human Decision Supremacy',
                    badgeColor: 'bg-stone-100 text-stone-800',
                    desc: 'Elected representatives and district planners review the complete evidence chain to inform public deliberation.',
                    foreignKey: 'Dossier Ref: #WB-NAD-842',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="p-5 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-9 h-9 rounded-xl bg-stone-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {step.num}
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{step.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${step.badgeColor}`}>
                            {step.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 shrink-0 self-end sm:self-center">
                      {step.foreignKey}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PRIVACY & AI RESPONSIBILITY */}
        {/* ================================================================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Section 1: Privacy Architecture */}
              <div className="space-y-4">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                    Privacy by Design
                  </span>
                  <h2 className="text-2xl font-bold text-[#112026] mt-1">
                    Citizen Privacy &amp; Data Minimization Architecture
                  </h2>
                  <p className="text-sm text-[#50636D] mt-2 leading-relaxed">
                    Baat2Badlav is built on strict data minimization. Civic intelligence requires understanding aggregated community needs, not profiling individual citizens.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="material-symbols-outlined text-teal-700 text-2xl">no_accounts</span>
                    <h3 className="text-sm font-bold text-stone-900">Zero Mandatory Accounts</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Citizens can submit voice notes or text without creating accounts, passwords, or providing national ID credentials.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="material-symbols-outlined text-teal-700 text-2xl">location_off</span>
                    <h3 className="text-sm font-bold text-stone-900">No Background GPS Tracking</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      The platform relies on user-selected administrative cascading dropdowns (State → District), avoiding continuous background location surveillance.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="material-symbols-outlined text-teal-700 text-2xl">shield_lock</span>
                    <h3 className="text-sm font-bold text-stone-900">Active PII Avoidance Warnings</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      The citizen intake terminal explicitly alerts contributors not to include names, phone numbers, Aadhaar numbers, or private addresses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: AI Responsibility & Confidence Explanation */}
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                    Model Boundaries
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#112026] mt-1">
                    What Gemini Does — and What It Is Forbidden From Doing
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* What Gemini DOES */}
                  <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <span className="material-symbols-outlined text-emerald-700">check_circle</span>
                      Permitted AI Scope (Gemini 3.5 Flash Lite)
                    </div>
                    <ul className="space-y-2 text-xs text-emerald-950">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>Transliterates dialectal voice notes across Indian vernacular languages.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>Structures unformatted text or speech into structured JSON with civic domain tags.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>Extracts civic domain, primary issue, normalized summary, entities/signals, severity, urgency, and urgency reasoning.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>Provides an <em>interpretation clarity confidence score</em> based on linguistic completeness and semantic consistency.</span>
                      </li>
                    </ul>
                  </div>

                  {/* What Gemini DOES NOT DO */}
                  <div className="p-6 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                      <span className="material-symbols-outlined text-red-700">block</span>
                      Strictly Forbidden AI Scope
                    </div>
                    <ul className="space-y-2 text-xs text-red-950">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span><strong>No policy decisions:</strong> AI never dictates public resource spending or allocation.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span><strong>No procurement approvals:</strong> Administrative and tender approvals strictly remain with public officials.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span><strong>No political or electoral modeling:</strong> Strictly zero voter modeling, partisan profiling, political polling, or electoral tracking.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span><strong>No autonomous scoring:</strong> Downstream gap and priority scores use deterministic mathematical code, never LLM generation.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* AI Confidence Score Clarification */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                  <span className="font-bold text-stone-900 font-mono text-[11px] uppercase tracking-wider block">
                    Important: How to Interpret AI Confidence Scores
                  </span>
                  <p className="text-stone-600 leading-relaxed">
                    When the AI interpretation outputs &ldquo;Confidence: 94%&rdquo;, this measures the <strong>semantic clarity and completeness of the linguistic extraction</strong>. It does <em>not</em> mean a 94% probability that the citizen's claim is objectively true in the real world, nor does it represent a statistical certainty that a project should be funded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: LIMITATIONS & FUTURE READINESS */}
        {/* ================================================================= */}
        {activeTab === 'limitations' && (
          <div className="space-y-8">
            <div className="bg-white border border-[#E3DECE] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Section 1: Known Limitations */}
              <div className="space-y-4">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                    Responsible AI Disclosures
                  </span>
                  <h2 className="text-2xl font-bold text-[#112026] mt-1">
                    System Limitations &amp; Operational Boundaries
                  </h2>
                  <p className="text-sm text-[#50636D] mt-2 leading-relaxed">
                    Responsible civic technology demands total honesty regarding system boundaries and constraints.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">
                      1. Multilingual Nuance &amp; Acoustic Variation
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Background village ambient noise, poor cellular microphone bandwidth, heavy local idioms, and code-mixed dialect phrasing can occasionally result in incomplete or ambiguous AI entity extraction.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">
                      2. Unverified Citizen Testimony
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Citizen submissions reflect subjective lived friction. They provide vital demand signals but are not independent technical engineering audits.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">
                      3. Synthetic Demonstration Baselines
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Current contextual data (infrastructure, demographic pressure, investment indices) are synthetic demonstration profiles for prototype evaluation, not official Census or Ministry accounts.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-900 uppercase font-mono">
                      4. Simulation Is Not Real-World Prediction
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Impact simulations evaluate mathematical sensitivity to assumptions; they are illustrative scenario estimates, not engineering guarantees or fiscal commitments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Future Readiness Roadmap */}
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                    Production Roadmap
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#112026] mt-1">
                    What Would Change for Real-World Deployment?
                  </h2>
                  <p className="text-sm text-[#50636D] mt-1 leading-relaxed">
                    Transitioning from this analytical prototype to live public administration deployment would require:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#033aaf]">
                      <span className="material-symbols-outlined text-[16px]">api</span>
                      Potential Future Data Sources
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Potential future deployment could incorporate validated public datasets and authorized institutional sources (such as Data.gov.in, PM GatiShakti, Swachh Bharat MIS, Jal Jeevan Mission, and NDAP), subject to access, provenance, governance, and verification requirements.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#033aaf]">
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      Institutional Governance
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Review workflows for Gram Sabhas, Block Development Officers, and District Magistrates.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#033aaf]">
                      <span className="material-symbols-outlined text-[16px]">security</span>
                      Independent Security Audits
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Third-party penetration testing, formal DPDP compliance audits, and strict role-based access control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Action Footer Banner */}
        <div className="mt-12 bg-[#111315] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              <span className="text-xs font-mono text-stone-400 uppercase font-semibold">
                Open &amp; Explainable Civic Technology
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Explore the live intelligence pipeline
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Inspect citizen demand clusters, development gap scores, and candidate project simulations across Indian districts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-2.5 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Master Dashboard
            </button>
            <button
              onClick={() => onNavigate('/citizen')}
              className="px-5 py-2.5 bg-[#E06D28] text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Share Citizen Voice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
