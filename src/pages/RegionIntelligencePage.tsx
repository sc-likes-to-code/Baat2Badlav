/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CivicCategory, CitizenSubmission, CitizenAIInterpretation } from '../types/citizen';
import { DemandHotspot } from '../types/demand';
import { DevelopmentGap } from '../types/development';
import { PriorityAssessment } from '../types/priority';
import { CandidateProject } from '../types/project';
import { ImpactScenario } from '../types/impact';

import { SYNTHETIC_CITIZEN_REPORTS } from '../data/syntheticCitizenReports';
import {
  getInfrastructureProfile,
  getDemographicProfile,
  getInvestmentProfile,
} from '../data/syntheticDevelopmentContext';
import {
  PROTOTYPE_DISTRICTS_BY_STATE,
  getStateName,
} from '../data/locations';

import { clusterCitizenSubmissions, deriveDemandHotspots, SubmissionWithInterpretation } from '../services/clusteringService';
import { calculateDevelopmentGaps } from '../services/developmentGapService';
import { calculatePriorityAssessments } from '../services/priorityService';
import { generateCandidateProjects } from '../services/projectService';
import { simulateImpact, PRESET_SCENARIOS } from '../services/impactSimulationService';

interface RegionIntelligencePageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
  liveSubmission?: CitizenSubmission | null;
  liveInterpretation?: CitizenAIInterpretation | null;
}

// Prototype districts available for drill-down
const PROTOTYPE_DISTRICT_KEYS = ['nadia', 'murshidabad', 'kalahandi', 'gaya', 'muzaffarpur', 'patna'];

export const RegionIntelligencePage: React.FC<RegionIntelligencePageProps> = ({
  onNavigate,
  currentPath = '/dashboard/region/nadia',
  liveSubmission,
  liveInterpretation,
}) => {
  // 1. Extract District ID from currentPath or fallback
  const rawIdFromPath = currentPath.split('/dashboard/region/')[1]?.split('/')[0]?.split('?')[0]?.split('#')[0] || '';
  const selectedDistrictId = (rawIdFromPath || 'nadia').toLowerCase().trim();

  // 2. State for lightweight filtering
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('ALL');
  const [selectedGapFilter, setSelectedGapFilter] = useState<string>('ALL');

  // 3. State for interactive simulation section
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [scenarioCoverage, setScenarioCoverage] = useState<number>(60);
  const [scenarioEffectiveness, setScenarioEffectiveness] = useState<number>(75);
  const [activePreset, setActivePreset] = useState<'conservative' | 'balanced' | 'highCoverage' | 'custom'>('balanced');

  // 4. Traceability inspection state
  const [selectedTraceProject, setSelectedTraceProject] = useState<string | null>(null);

  // 5. Lookup district metadata
  const districtMeta = useMemo(() => {
    for (const [sId, dList] of Object.entries(PROTOTYPE_DISTRICTS_BY_STATE)) {
      const found = dList.find((d) => d.id.toLowerCase() === selectedDistrictId);
      if (found) {
        return {
          id: found.id,
          name: found.name,
          stateId: sId,
          stateName: getStateName(sId),
          isValid: true,
        };
      }
    }
    // Check fallback for any custom key
    if (selectedDistrictId === 'nadia') return { id: 'nadia', name: 'Nadia', stateId: 'WB', stateName: 'West Bengal', isValid: true };
    if (selectedDistrictId === 'murshidabad') return { id: 'murshidabad', name: 'Murshidabad', stateId: 'WB', stateName: 'West Bengal', isValid: true };
    if (selectedDistrictId === 'kalahandi') return { id: 'kalahandi', name: 'Kalahandi', stateId: 'OD', stateName: 'Odisha', isValid: true };
    if (selectedDistrictId === 'gaya') return { id: 'gaya', name: 'Gaya', stateId: 'BR', stateName: 'Bihar', isValid: true };
    if (selectedDistrictId === 'muzaffarpur') return { id: 'muzaffarpur', name: 'Muzaffarpur', stateId: 'BR', stateName: 'Bihar', isValid: true };
    if (selectedDistrictId === 'patna') return { id: 'patna', name: 'Patna', stateId: 'BR', stateName: 'Bihar', isValid: true };

    return {
      id: selectedDistrictId,
      name: selectedDistrictId.charAt(0).toUpperCase() + selectedDistrictId.slice(1),
      stateId: 'UNKNOWN',
      stateName: 'Unknown State',
      isValid: false,
    };
  }, [selectedDistrictId]);

  // 6. Assemble all reports (synthetic + live)
  const allReports: SubmissionWithInterpretation[] = useMemo(() => {
    const records = [...SYNTHETIC_CITIZEN_REPORTS];
    if (liveSubmission && liveInterpretation) {
      records.push({
        submission: liveSubmission,
        interpretation: liveInterpretation,
      });
    }
    return records;
  }, [liveSubmission, liveInterpretation]);

  // 7. Execute deterministic downstream pipeline
  const pipelineData = useMemo(() => {
    const clusters = clusterCitizenSubmissions(allReports);
    const hotspots = deriveDemandHotspots(clusters);
    const gaps = calculateDevelopmentGaps(hotspots);
    const priorities = calculatePriorityAssessments(gaps, hotspots);
    const projects = generateCandidateProjects(priorities);

    return { clusters, hotspots, gaps, priorities, projects };
  }, [allReports]);

  // 8. Filter data specifically for this region
  const regionRawReports = useMemo(() => {
    return allReports.filter(
      (r) => r.submission.location.districtId.toLowerCase() === selectedDistrictId
    );
  }, [allReports, selectedDistrictId]);

  const regionHotspots = useMemo(() => {
    return pipelineData.hotspots.filter(
      (h) => h.districtId.toLowerCase() === selectedDistrictId
    );
  }, [pipelineData.hotspots, selectedDistrictId]);

  const regionGaps = useMemo(() => {
    return pipelineData.gaps.filter(
      (g) => g.districtId.toLowerCase() === selectedDistrictId
    );
  }, [pipelineData.gaps, selectedDistrictId]);

  const regionPriorities = useMemo(() => {
    return pipelineData.priorities.filter(
      (p) => p.districtId.toLowerCase() === selectedDistrictId
    );
  }, [pipelineData.priorities, selectedDistrictId]);

  const regionProjects = useMemo(() => {
    return pipelineData.projects.filter(
      (p) => p.districtId.toLowerCase() === selectedDistrictId
    );
  }, [pipelineData.projects, selectedDistrictId]);

  // 9. Contextual Profiles
  const infraProfile = useMemo(() => {
    return getInfrastructureProfile(selectedDistrictId);
  }, [selectedDistrictId]);

  const demoProfile = useMemo(() => {
    return getDemographicProfile(selectedDistrictId);
  }, [selectedDistrictId]);

  const investProfile = useMemo(() => {
    return getInvestmentProfile(selectedDistrictId);
  }, [selectedDistrictId]);

  // 10. Filtered subsets based on interactive filters
  const filteredHotspots = useMemo(() => {
    return regionHotspots.filter((h) => {
      if (selectedDomainFilter !== 'ALL' && h.domain !== selectedDomainFilter) return false;
      return true;
    });
  }, [regionHotspots, selectedDomainFilter]);

  const filteredGaps = useMemo(() => {
    return regionGaps.filter((g) => {
      if (selectedDomainFilter !== 'ALL' && g.civicDomain !== selectedDomainFilter) return false;
      if (selectedGapFilter !== 'ALL' && g.gapLevel !== selectedGapFilter) return false;
      return true;
    });
  }, [regionGaps, selectedDomainFilter, selectedGapFilter]);

  const filteredPriorities = useMemo(() => {
    return regionPriorities.filter((p) => {
      if (selectedDomainFilter !== 'ALL' && p.civicDomain !== selectedDomainFilter) return false;
      if (selectedPriorityFilter !== 'ALL' && p.priorityBand !== selectedPriorityFilter) return false;
      return true;
    });
  }, [regionPriorities, selectedDomainFilter, selectedPriorityFilter]);

  const filteredProjects = useMemo(() => {
    return regionProjects.filter((p) => {
      if (selectedDomainFilter !== 'ALL' && p.civicDomain !== selectedDomainFilter) return false;
      return true;
    });
  }, [regionProjects, selectedDomainFilter]);

  // 11. Domain distribution stats
  const domainDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of regionRawReports) {
      const dom = r.interpretation.civicDomain || r.submission.category || 'Other';
      counts[dom] = (counts[dom] || 0) + 1;
    }
    const total = regionRawReports.length || 1;
    return Object.entries(counts).map(([domain, count]) => ({
      domain,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [regionRawReports]);

  // 12. Active project for simulation
  const activeProject = useMemo(() => {
    if (activeProjectId) {
      const found = regionProjects.find((p) => p.id === activeProjectId);
      if (found) return found;
    }
    return regionProjects.length > 0 ? regionProjects[0] : null;
  }, [activeProjectId, regionProjects]);

  const activePriorityForSimulation = useMemo(() => {
    if (!activeProject) return null;
    return pipelineData.priorities.find((p) => p.id === activeProject.priorityAssessmentId) || null;
  }, [activeProject, pipelineData.priorities]);

  const activeGapForSimulation = useMemo(() => {
    if (!activePriorityForSimulation) return null;
    return pipelineData.gaps.find((g) => g.id === activePriorityForSimulation.developmentGapId) || null;
  }, [activePriorityForSimulation, pipelineData.gaps]);

  const simulationResult = useMemo(() => {
    if (!activeProject || !activePriorityForSimulation || !activeGapForSimulation) return null;

    const scenario: ImpactScenario = {
      id: `scen-${activeProject.id}`,
      candidateProjectId: activeProject.id,
      priorityAssessmentId: activePriorityForSimulation.id,
      developmentGapId: activeGapForSimulation.id,
      scenarioName: activePreset,
      interventionCoverage: scenarioCoverage,
      implementationEffectiveness: scenarioEffectiveness,
    };

    return simulateImpact(activeProject, activePriorityForSimulation, activeGapForSimulation, scenario);
  }, [activeProject, activePriorityForSimulation, activeGapForSimulation, scenarioCoverage, scenarioEffectiveness, activePreset]);

  // Preset Handler
  const handlePresetSelect = (presetKey: 'conservative' | 'balanced' | 'highCoverage') => {
    const cfg = PRESET_SCENARIOS[presetKey];
    setScenarioCoverage(cfg.coverage);
    setScenarioEffectiveness(cfg.effectiveness);
    setActivePreset(presetKey);
  };

  // Slider change handler
  const handleSliderChange = (type: 'coverage' | 'effectiveness', value: number) => {
    if (type === 'coverage') setScenarioCoverage(value);
    if (type === 'effectiveness') setScenarioEffectiveness(value);
    setActivePreset('custom');
  };

  // 13. Summary Metrics
  const avgGapScore = useMemo(() => {
    if (regionGaps.length === 0) return 0;
    const sum = regionGaps.reduce((acc, g) => acc + g.developmentGapScore, 0);
    return Math.round(sum / regionGaps.length);
  }, [regionGaps]);

  const criticalSignalCount = useMemo(() => {
    return regionPriorities.filter((p) => p.priorityBand === 'Critical Signal').length;
  }, [regionPriorities]);

  // =========================================================================
  // INVALID REGION STATE
  // =========================================================================
  if (!districtMeta.isValid) {
    return (
      <main className="w-full bg-[#f9f9fc] min-h-[calc(100vh-14rem)] text-[#1a1c1e] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
            <span className="material-symbols-outlined text-3xl">wrong_location</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Region Not Found
            </span>
            <h1 className="text-3xl font-extrabold text-[#1a1c1e] tracking-tight">
              District &ldquo;{selectedDistrictId}&rdquo; is not currently indexed
            </h1>
            <p className="text-sm text-[#444653] max-w-xl mx-auto leading-relaxed">
              The requested regional dossier identifier is not in the active prototype demonstration catalog. You can explore one of our fully indexed districts below or return to the master intelligence dashboard.
            </p>
          </div>

          {/* Quick switcher cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto">
            {PROTOTYPE_DISTRICT_KEYS.map((dKey) => {
              const profile = getInfrastructureProfile(dKey);
              return (
                <button
                  key={dKey}
                  onClick={() => onNavigate(`/dashboard/region/${dKey}`)}
                  className="p-4 rounded-xl bg-white border border-stone-200 hover:border-[#033aaf] hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold block">
                    {profile.stateName}
                  </span>
                  <span className="text-base font-bold text-[#1a1c1e] group-hover:text-[#033aaf] transition-colors block">
                    {profile.districtName}
                  </span>
                  <span className="text-xs text-stone-500 font-mono mt-1 block">
                    Open Dossier →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111315] hover:bg-stone-800 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Back to Master Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // VALID REGION VIEW
  // =========================================================================
  return (
    <main className="w-full bg-[#f9f9fc] min-h-[calc(100vh-14rem)] text-[#1a1c1e] pb-24">
      {/* Top Breadcrumbs & Regional Sub-Bar */}
      <div className="w-full bg-[#f3f3f6]/80 py-2.5 border-b border-stone-200/80 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[#444653] flex-wrap">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="hover:underline text-[#033aaf] font-semibold cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Dashboard</span>
            </button>
            <span className="text-stone-300 font-mono">/</span>
            <span>{districtMeta.stateName}</span>
            <span className="text-stone-300 font-mono">/</span>
            <span className="font-bold text-[#1a1c1e]">{districtMeta.name}</span>
            <span className="text-stone-300 font-mono">/</span>
            <span className="text-stone-500 font-mono">Region Intelligence</span>
          </div>

          {/* Quick District Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold mr-1 hidden sm:inline">
              Switch District:
            </span>
            {PROTOTYPE_DISTRICT_KEYS.map((dKey) => {
              const isCurrent = dKey === selectedDistrictId;
              const name = dKey.charAt(0).toUpperCase() + dKey.slice(1);
              return (
                <button
                  key={dKey}
                  onClick={() => onNavigate(`/dashboard/region/${dKey}`)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#033aaf] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* ================================================================= */}
        {/* HEADER: Region Dossier Summary */}
        {/* ================================================================= */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#033aaf]/10 text-[#033aaf] text-[10px] font-mono tracking-widest uppercase font-bold">
                <span className="material-symbols-outlined text-[14px]">folder_supervised</span>
                Region Intelligence Dossier
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-mono border border-stone-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
                Synthetic Demonstration Data
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1c1e] tracking-tight">
              {districtMeta.name} <span className="text-stone-400 font-normal">·</span> {districtMeta.stateName}
            </h1>

            <p className="text-sm sm:text-base text-[#444653] leading-relaxed">
              Multi-dimensional development intelligence synthesized from localized citizen demand signals, official-format infrastructure baselines, and demographic exposure across {districtMeta.name} district.
            </p>
          </div>

          {/* Quick Stat Pill Matrix */}
          <div className="flex flex-col justify-between bg-[#f3f3f6] rounded-xl p-5 min-w-[280px] border border-stone-200/80 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-2xl font-mono font-bold text-[#033aaf] block">
                  {regionRawReports.length}
                </span>
                <span className="text-[10px] font-mono text-stone-500 uppercase">Citizen Voices</span>
              </div>
              <div>
                <span className="text-2xl font-mono font-bold text-[#1a1c1e] block">
                  {regionHotspots.length}
                </span>
                <span className="text-[10px] font-mono text-stone-500 uppercase">Hotspots</span>
              </div>
              <div>
                <span className="text-2xl font-mono font-bold text-[#E06D28] block">
                  {regionProjects.length}
                </span>
                <span className="text-[10px] font-mono text-stone-500 uppercase">Projects</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 text-center">
              <span className="text-[11px] font-mono text-stone-500 block">
                Population: {(demoProfile.population / 1000000).toFixed(2)}M · Rural: {Math.round((demoProfile.ruralPopulationShare ?? 0.7) * 100)}%
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* OVERVIEW METRICS: 5 Key Indicators */}
        {/* ================================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">1. Citizen Voices</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#1a1c1e]">
              {regionRawReports.length}
            </div>
            <span className="text-[11px] text-stone-500 block">
              {regionRawReports.length > 0 ? 'Vernacular submissions' : 'No active reports'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">2. Demand Hotspots</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#033aaf]">
              {regionHotspots.length}
            </div>
            <span className="text-[11px] text-stone-500 block">
              Spatial clusters
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">3. Avg Development Gap</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#ba1a1a]">
              {avgGapScore > 0 ? `${avgGapScore}/100` : 'N/A'}
            </div>
            <span className="text-[11px] text-stone-500 block">
              4-factor synthesized
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">4. Priority Signals</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#E06D28]">
              {regionPriorities.length}
            </div>
            <span className="text-[11px] text-stone-500 block">
              {criticalSignalCount > 0 ? `${criticalSignalCount} Critical Level` : 'Active assessments'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">5. Candidate Projects</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0F766E]">
              {regionProjects.length}
            </div>
            <span className="text-[11px] text-stone-500 block">
              Modeled archetypes
            </span>
          </div>
        </section>

        {/* ================================================================= */}
        {/* LIGHTWEIGHT FILTER BAR */}
        {/* ================================================================= */}
        {regionHotspots.length > 0 && (
          <section className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
              <span className="material-symbols-outlined text-[18px] text-[#033aaf]">filter_alt</span>
              <span>Filter Regional Intelligence:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {/* Domain Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-mono text-[11px]">Domain:</span>
                <select
                  value={selectedDomainFilter}
                  onChange={(e) => setSelectedDomainFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#033aaf]"
                >
                  <option value="ALL">All Domains</option>
                  <option value="Roads & Mobility">Roads & Mobility</option>
                  <option value="Water Access">Water Access</option>
                  <option value="Healthcare Access">Healthcare Access</option>
                  <option value="Electricity & Power">Electricity & Power</option>
                  <option value="School Facilities">School Facilities</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-mono text-[11px]">Priority:</span>
                <select
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#033aaf]"
                >
                  <option value="ALL">All Signals</option>
                  <option value="Critical Signal">Critical Signal</option>
                  <option value="High Signal">High Signal</option>
                  <option value="Moderate Signal">Moderate Signal</option>
                </select>
              </div>

              {/* Gap Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-mono text-[11px]">Gap:</span>
                <select
                  value={selectedGapFilter}
                  onChange={(e) => setSelectedGapFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#033aaf]"
                >
                  <option value="ALL">All Gaps</option>
                  <option value="Very High">Very High (≥75)</option>
                  <option value="High">High (55–74)</option>
                  <option value="Moderate">Moderate (35–54)</option>
                </select>
              </div>

              {(selectedDomainFilter !== 'ALL' || selectedPriorityFilter !== 'ALL' || selectedGapFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedDomainFilter('ALL');
                    setSelectedPriorityFilter('ALL');
                    setSelectedGapFilter('ALL');
                  }}
                  className="text-[11px] font-mono text-[#ba1a1a] hover:underline cursor-pointer ml-2"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* STORY STAGE 1: What are citizens reporting? */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
              Step 1 of 6 · Community Signals
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
              What are citizens reporting in {districtMeta.name}?
            </h2>
            <p className="text-xs sm:text-sm text-[#444653] mt-1">
              Distribution of vernacular citizen testimony and localized demand concentrations.
            </p>
          </div>

          {/* Domain Distribution & Hotspot Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Civic Domain Distribution */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#1a1c1e]">
                Civic Domain Distribution
              </h3>
              <p className="text-xs text-stone-500">
                Percentage of verified citizen reports by sector in {districtMeta.name}.
              </p>

              {domainDistribution.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {domainDistribution.map((item) => (
                    <div key={item.domain} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-stone-800">{item.domain}</span>
                        <span className="font-mono text-stone-600">{item.count} reports ({item.pct}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#033aaf] h-2 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-stone-400 font-mono">
                  No citizen demand reports logged for this district.
                </div>
              )}
            </div>

            {/* Right: Demand Hotspots List */}
            <div className="lg:col-span-8 space-y-4">
              {filteredHotspots.length > 0 ? (
                filteredHotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#033aaf]/10 text-[#033aaf] text-[11px] font-semibold font-mono">
                            {hotspot.domain}
                          </span>
                          <span className="text-xs font-mono text-stone-500">
                            ID: {hotspot.id}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#1a1c1e] mt-1.5">
                          {hotspot.demandTitle}
                        </h4>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-mono font-bold border border-stone-200">
                        {hotspot.reportCount} Reports Aggregated
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#444653] leading-relaxed">
                      {hotspot.normalizedDemand}
                    </p>

                    {/* Localities & Key Signals */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-[11px] font-mono text-stone-500 font-semibold">Localities:</span>
                      {hotspot.localities.map((loc) => (
                        <span key={loc} className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-mono">
                          {loc}
                        </span>
                      ))}
                    </div>

                    {/* Severity & Urgency distributions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase block mb-1">Severity Breakdown</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-red-700 font-bold">Crit: {hotspot.severityDistribution.Critical}</span>
                          <span>·</span>
                          <span className="text-orange-700 font-semibold">High: {hotspot.severityDistribution.High}</span>
                          <span>·</span>
                          <span className="text-stone-600">Med: {hotspot.severityDistribution.Medium}</span>
                          <span>·</span>
                          <span className="text-stone-400">Low: {hotspot.severityDistribution.Low}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase block mb-1">Urgency Profile</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-red-700 font-bold">Imm: {hotspot.urgencyDistribution.Immediate}</span>
                          <span>·</span>
                          <span className="text-amber-700 font-semibold">Seas: {hotspot.urgencyDistribution['Seasonal Risk']}</span>
                          <span>·</span>
                          <span className="text-stone-600">Rout: {hotspot.urgencyDistribution.Routine}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-stone-200/80 text-center space-y-2">
                  <span className="material-symbols-outlined text-3xl text-stone-300">search_off</span>
                  <h4 className="text-sm font-bold text-stone-700">No Demand Hotspots Found</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    No active demand hotspots match the current filter criteria for {districtMeta.name}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 2: What contextual factors matter? */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
              Step 2 of 6 · Development Context
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
              Contextual Infrastructure &amp; Demographic Baselines
            </h2>
            <p className="text-xs sm:text-sm text-[#444653] mt-1">
              Cross-referencing demand against baseline access indicators, population density, and recent capital allocations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Infrastructure Access */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold">Baseline Access</span>
                <span className="material-symbols-outlined text-lg text-[#033aaf]">account_tree</span>
              </div>
              <h3 className="text-base font-bold text-[#1a1c1e]">Infrastructure Coverage</h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">Road Accessibility</span>
                    <span className="font-mono font-bold">{Math.round((infraProfile.indicators.roadAccessibility ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${(infraProfile.indicators.roadAccessibility ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">Water Access</span>
                    <span className="font-mono font-bold">{Math.round((infraProfile.indicators.waterAccess ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${(infraProfile.indicators.waterAccess ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">Healthcare Access</span>
                    <span className="font-mono font-bold">{Math.round((infraProfile.indicators.healthcareAccess ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${(infraProfile.indicators.healthcareAccess ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">Electricity Reliability</span>
                    <span className="font-mono font-bold">{Math.round((infraProfile.indicators.electricityReliability ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${(infraProfile.indicators.electricityReliability ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">School Adequacy</span>
                    <span className="font-mono font-bold">{Math.round((infraProfile.indicators.schoolFacilityAdequacy ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${(infraProfile.indicators.schoolFacilityAdequacy ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {infraProfile.coverageNotes.length > 0 && (
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                  {infraProfile.coverageNotes[0]}
                </div>
              )}
            </div>

            {/* 2. Demographic Exposure */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#E06D28] uppercase font-bold">Demographics</span>
                <span className="material-symbols-outlined text-lg text-[#E06D28]">groups</span>
              </div>
              <h3 className="text-base font-bold text-[#1a1c1e]">Population Exposure</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Total Population</span>
                  <span className="font-mono font-bold">{(demoProfile.population).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Population Density</span>
                  <span className="font-mono font-bold">{demoProfile.populationDensity} / km²</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Rural Population Share</span>
                  <span className="font-mono font-bold">{Math.round((demoProfile.ruralPopulationShare ?? 0.7) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-600">Vulnerable Segment Share</span>
                  <span className="font-mono font-bold">{Math.round((demoProfile.vulnerablePopulationShare ?? 0.3) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-600">Seasonal Vulnerability Pressure</span>
                  <span className="font-mono font-bold">{Math.round((demoProfile.pressureIndicators.seasonalPressure ?? 0.5) * 100)}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                Service Demand Strain: {Math.round((demoProfile.pressureIndicators.serviceDemandPressure ?? 0.5) * 100)}%
              </div>
            </div>

            {/* 3. Recent Capital Investment */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#0F766E] uppercase font-bold">Capital Allocation</span>
                <span className="material-symbols-outlined text-lg text-[#0F766E]">payments</span>
              </div>
              <h3 className="text-base font-bold text-[#1a1c1e]">Recent Public Investment</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-stone-700">Recent Investment Index</span>
                    <span className="font-mono font-bold">{Math.round((investProfile.recentInvestmentIndex ?? 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0F766E] h-2 rounded-full" style={{ width: `${(investProfile.recentInvestmentIndex ?? 0.5) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Domain Investment Coverage</span>
                  {investProfile.investmentByDomain.slice(0, 4).map((inv) => (
                    <div key={inv.domain} className="flex justify-between items-center text-[11px] py-0.5">
                      <span className="text-stone-600">{inv.domain}</span>
                      <span className="font-mono font-bold">{Math.round(inv.investmentIndex * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {investProfile.coverageNotes.length > 0 && (
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                  {investProfile.coverageNotes[0]}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 3: Where are the development gaps? */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
              Step 3 of 6 · Development Gap Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
              Development Gap Indices for {districtMeta.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#444653] mt-1">
              Deterministic 4-factor scoring: 0.40 × Demand + 0.30 × Infra Need + 0.20 × Demo Pressure + 0.10 × Investment Gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGaps.length > 0 ? (
              filteredGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#033aaf] font-bold">
                        {gap.civicDomain}
                      </span>
                      <h4 className="text-base font-bold text-[#1a1c1e] mt-0.5">
                        {gap.demandTitle}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#ba1a1a] block">
                        {gap.developmentGapScore}
                        <span className="text-xs font-normal text-stone-400">/100</span>
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          gap.gapLevel === 'Very High'
                            ? 'bg-red-100 text-red-800'
                            : gap.gapLevel === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {gap.gapLevel} Gap
                      </span>
                    </div>
                  </div>

                  {/* 4 Factor Breakdown Bars */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-stone-600">Demand Signal (40%)</span>
                        <span className="font-mono font-semibold">{Math.round(gap.demandSignal * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#033aaf] h-1.5 rounded-full" style={{ width: `${gap.demandSignal * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-stone-600">Infrastructure Need (30%)</span>
                        <span className="font-mono font-semibold">{Math.round(gap.infrastructureNeed * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${gap.infrastructureNeed * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-stone-600">Demographic Pressure (20%)</span>
                        <span className="font-mono font-semibold">{Math.round(gap.demographicPressure * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${gap.demographicPressure * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-stone-600">Investment Gap (10%)</span>
                        <span className="font-mono font-semibold">{Math.round(gap.investmentGap * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-700 h-1.5 rounded-full" style={{ width: `${gap.investmentGap * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Formula String */}
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono text-stone-700">
                    [0.40 × {gap.demandSignal}] + [0.30 × {gap.infrastructureNeed}] + [0.20 × {gap.demographicPressure}] + [0.10 × {gap.investmentGap}] = {gap.developmentGapScore}/100
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    &ldquo;{gap.explanation}&rdquo;
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-stone-200/80 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-stone-300">dataset</span>
                <h4 className="text-sm font-bold text-stone-700">No Development Gaps Indexed</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  No development gap records match the active filter criteria for this region.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 4: Which signals stand out? */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
              Step 4 of 6 · Priority Intelligence
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
              Priority Signals &amp; Explainable Ranking
            </h2>
            <p className="text-xs sm:text-sm text-[#444653] mt-1">
              5-factor analytical priority index derived for deliberative planning support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPriorities.length > 0 ? (
              filteredPriorities.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#033aaf] font-bold">
                        {p.civicDomain}
                      </span>
                      <h4 className="text-base font-bold text-[#1a1c1e] mt-0.5">
                        {p.demandTitle}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#033aaf] block">
                        {p.priorityScore}
                        <span className="text-xs font-normal text-stone-400">/100</span>
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          p.priorityBand === 'Critical Signal'
                            ? 'bg-red-100 text-red-800'
                            : p.priorityBand === 'High Signal'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.priorityBand}
                      </span>
                    </div>
                  </div>

                  {/* 5 Priority Factor breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-stone-100">
                    <div className="bg-stone-50 p-2 rounded border border-stone-200/60">
                      <span className="text-stone-500 block text-[10px]">Demand (30%)</span>
                      <span className="font-bold text-stone-800">{Math.round(p.factors.demandIntensity * 100)}%</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded border border-stone-200/60">
                      <span className="text-stone-500 block text-[10px]">Gap (30%)</span>
                      <span className="font-bold text-stone-800">{Math.round(p.factors.developmentGap * 100)}%</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded border border-stone-200/60">
                      <span className="text-stone-500 block text-[10px]">Urgency (15%)</span>
                      <span className="font-bold text-stone-800">{Math.round(p.factors.urgency * 100)}%</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded border border-stone-200/60">
                      <span className="text-stone-500 block text-[10px]">Geo Conc (15%)</span>
                      <span className="font-bold text-stone-800">{Math.round(p.factors.geographicConcentration * 100)}%</span>
                    </div>
                    <div className="bg-stone-50 p-2 rounded border border-stone-200/60 col-span-2 sm:col-span-1">
                      <span className="text-stone-500 block text-[10px]">Pressure (10%)</span>
                      <span className="font-bold text-stone-800">{Math.round(p.factors.servicePressure * 100)}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#444653] leading-relaxed">
                    {p.explanation}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-stone-200/80 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-stone-300">priority_high</span>
                <h4 className="text-sm font-bold text-stone-700">No Priority Signals</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  No priority signals match the selected filter parameters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 5: What candidate pathways emerge? */}
        {/* ================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
              Step 5 of 6 · Candidate Development Projects
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
              Candidate Intervention Archetypes
            </h2>
            <p className="text-xs sm:text-sm text-[#444653] mt-1">
              Demonstration intervention pathways mapped from priority signals. (These are candidate project options for demonstration, not government procurement decisions).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-mono font-bold border border-teal-200">
                        {proj.projectType}
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        ID: {proj.id}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-[#1a1c1e]">
                      {proj.projectTitle}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#444653] leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                      <span className="text-[10px] font-mono text-stone-500 uppercase font-bold">Target Need:</span>
                      <p className="text-xs text-stone-800">{proj.targetNeed}</p>
                    </div>

                    {/* Feasibility & Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-stone-500 uppercase font-bold">
                        Implementation Considerations:
                      </span>
                      <ul className="space-y-1">
                        {proj.implementationConsiderations.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-stone-600">
                            <span className="material-symbols-outlined text-[14px] text-teal-600 shrink-0 mt-0.5">check_circle</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedTraceProject(proj.id);
                        const el = document.getElementById('traceability-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-mono text-[#033aaf] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">timeline</span>
                      <span>Inspect Lineage</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        const el = document.getElementById('simulation-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-xl bg-[#111315] hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">tune</span>
                      <span>Simulate Impact ↓</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-stone-200/80 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-stone-300">construction</span>
                <h4 className="text-sm font-bold text-stone-700">No Candidate Projects</h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  No candidate project archetypes available for the selected filters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 6: End-to-End Traceability & Lineage */}
        {/* ================================================================= */}
        <section id="traceability-section" className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                Explainability &amp; Lineage Audit
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
                End-to-End Analytical Traceability
              </h2>
              <p className="text-xs sm:text-sm text-[#444653] mt-1">
                Verifiable chain of custody linking lived citizen testimony directly to simulated development interventions.
              </p>
            </div>

            {regionProjects.length > 0 && (
              <select
                value={selectedTraceProject || regionProjects[0]?.id}
                onChange={(e) => setSelectedTraceProject(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#033aaf]"
              >
                {regionProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    Lineage for: {p.projectTitle}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Visual Step Pipeline Flow */}
          {regionProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold block">1. CITIZEN DEMAND</span>
                <span className="text-xs font-bold text-stone-900 block truncate">
                  {regionRawReports.length} Reports Logged
                </span>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Multilingual audio/text intake normalized via Gemini civic ontology.
                </p>
                <span className="inline-block font-mono text-[10px] text-stone-400">
                  Ref: {regionRawReports[0]?.submission.id || 'N/A'}
                </span>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold block">2. DEMAND HOTSPOT</span>
                <span className="text-xs font-bold text-stone-900 block truncate">
                  {regionHotspots[0]?.demandTitle || 'Hotspot Derived'}
                </span>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Spatial concentration across {districtMeta.name} habitations.
                </p>
                <span className="inline-block font-mono text-[10px] text-stone-400">
                  Ref: {regionHotspots[0]?.id || 'N/A'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono text-[#033aaf] font-bold block">3. GAP &amp; PRIORITY</span>
                <span className="text-xs font-bold text-stone-900 block truncate">
                  Gap: {regionGaps[0]?.developmentGapScore || 'N/A'} · Priority: {regionPriorities[0]?.priorityScore || 'N/A'}
                </span>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Triangulated with baseline access ({Math.round((infraProfile.indicators.roadAccessibility ?? 0.5) * 100)}%).
                </p>
                <span className="inline-block font-mono text-[10px] text-stone-400">
                  Ref: {regionPriorities[0]?.id || 'N/A'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
                <span className="text-[10px] font-mono text-teal-800 font-bold block">4. CANDIDATE INTERVENTION</span>
                <span className="text-xs font-bold text-teal-950 block truncate">
                  {regionProjects[0]?.projectTitle || 'Candidate Project'}
                </span>
                <p className="text-[11px] text-teal-800 leading-snug">
                  Deterministic archetype for impact simulation modeling.
                </p>
                <span className="inline-block font-mono text-[10px] text-teal-600">
                  Ref: {regionProjects[0]?.id || 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 font-mono">
              Traceability pipeline is inactive when zero demand signals exist in the district.
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* STORY STAGE 7: Interactive Impact Simulation Engine */}
        {/* ================================================================= */}
        <section id="simulation-section" className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-[#033aaf] uppercase font-bold tracking-wider">
                Step 6 of 6 · Interactive Scenario Evaluation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a1c1e] tracking-tight mt-0.5">
                Impact Simulation Engine for {districtMeta.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#444653] mt-1">
                Explore hypothetical intervention outcomes by adjusting coverage and implementation effectiveness assumptions.
              </p>
            </div>

            {regionProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-500">Project:</span>
                <select
                  value={activeProject?.id || ''}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#033aaf]"
                >
                  {regionProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectTitle}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeProject && simulationResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Scenario Controls */}
              <div className="lg:col-span-5 space-y-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1e]">Scenario Configuration</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select a standardized preset or adjust parameters freely.
                  </p>
                </div>

                {/* Preset Scenario Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {(['conservative', 'balanced', 'highCoverage'] as const).map((pKey) => {
                    const preset = PRESET_SCENARIOS[pKey];
                    const isActive = activePreset === pKey;
                    return (
                      <button
                        key={pKey}
                        onClick={() => handlePresetSelect(pKey)}
                        className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                          isActive
                            ? 'bg-[#033aaf] text-white border-[#033aaf] shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xs font-bold block">{preset.name}</span>
                        <span className={`text-[10px] font-mono block mt-0.5 ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                          {preset.coverage}% / {preset.effectiveness}%
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Slider 1: Intervention Coverage */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-stone-800">
                      Intervention Coverage:
                    </label>
                    <span className="font-mono font-bold text-[#033aaf] bg-white px-2 py-0.5 rounded border border-stone-200">
                      {scenarioCoverage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scenarioCoverage}
                    onChange={(e) => handleSliderChange('coverage', Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#033aaf]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>0% (No rollout)</span>
                    <span>100% (Universal)</span>
                  </div>
                </div>

                {/* Slider 2: Implementation Effectiveness */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-stone-800">
                      Implementation Effectiveness:
                    </label>
                    <span className="font-mono font-bold text-[#0F766E] bg-white px-2 py-0.5 rounded border border-stone-200">
                      {scenarioEffectiveness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scenarioEffectiveness}
                    onChange={(e) => handleSliderChange('effectiveness', Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-stone-400">
                    <span>0% (Failed)</span>
                    <span>100% (Optimal)</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-500 font-mono">
                  Combined Strength: <strong>{((scenarioCoverage / 100) * (scenarioEffectiveness / 100) * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* Right Column: Projected Scenario Outcomes */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1c1e]">Projected Scenario Outcomes</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Estimated under {scenarioCoverage}% coverage and {scenarioEffectiveness}% implementation effectiveness.
                  </p>
                </div>

                {/* Score Comparison Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Baseline */}
                  <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200 space-y-2">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">
                      Baseline Gap Score
                    </span>
                    <div className="text-3xl sm:text-4xl font-mono font-extrabold text-stone-800">
                      {simulationResult.baseline.developmentGapScore}
                      <span className="text-sm font-normal text-stone-500">/100</span>
                    </div>
                    <span className="text-xs text-stone-500 block">
                      Current unmitigated deficit
                    </span>
                  </div>

                  {/* Projected Residual */}
                  <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                    <span className="text-[10px] font-mono text-teal-800 uppercase font-bold block">
                      Projected Residual Gap
                    </span>
                    <div className="text-3xl sm:text-4xl font-mono font-extrabold text-teal-900">
                      {simulationResult.projected.residualDevelopmentGap}
                      <span className="text-sm font-normal text-teal-700">/100</span>
                    </div>
                    <span className="text-xs text-teal-800 font-semibold block">
                      Reduction: −{simulationResult.projected.developmentGapReduction} pts ({simulationResult.impact.gapReductionPercent}%)
                    </span>
                  </div>
                </div>

                {/* Specific Modeled Reductions */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Modeled Demand Red</span>
                    <span className="text-lg font-mono font-bold text-[#033aaf]">
                      {simulationResult.impact.demandReductionPercent}%
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Infra Improvement</span>
                    <span className="text-lg font-mono font-bold text-[#0F766E]">
                      {simulationResult.impact.infrastructureImprovementPercent}%
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Service Reach</span>
                    <span className="text-lg font-mono font-bold text-[#E06D28]">
                      {simulationResult.impact.serviceReachPercent}%
                    </span>
                  </div>
                </div>

                {/* Explainable Scenario Narrative */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                  <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block">
                    Modeled Scenario Explanation:
                  </span>
                  <p className="text-xs text-[#444653] leading-relaxed">
                    {simulationResult.explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 font-mono">
              Select a valid candidate project to run scenario simulations.
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* FOOTER CALL TO ACTION & TRANSPARENCY NOTE */}
        {/* ================================================================= */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#111315] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              <span className="text-xs font-mono text-stone-400 uppercase font-semibold">
                Transparent Civic Intelligence
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Ready to explore statewide demand signals?
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Compare regional development gaps across multiple districts, inspect data lineages, or submit a new citizen voice note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer"
            >
              Explore Master Dashboard
            </button>
            <button
              onClick={() => onNavigate('/citizen')}
              className="px-5 py-2.5 rounded-full bg-[#E06D28] text-white hover:bg-orange-600 text-xs font-bold transition-all cursor-pointer"
            >
              Share Citizen Voice
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};
