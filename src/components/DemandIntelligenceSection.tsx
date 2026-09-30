/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  CivicCategory,
  CitizenSubmission,
  CitizenAIInterpretation,
  LiveCitizenRecord,
} from '../types/citizen';
import { DemandCluster, DemandHotspot } from '../types/demand';
import { DevelopmentGap, GapLevel } from '../types/development';
import { PriorityAssessment, PriorityBand } from '../types/priority';
import { CandidateProject } from '../types/project';
import { ImpactScenario, ImpactSimulationResult } from '../types/impact';
import {
  clusterCitizenSubmissions,
  deriveDemandHotspots,
  SubmissionWithInterpretation,
} from '../services/clusteringService';
import { calculateDevelopmentGaps } from '../services/developmentGapService';
import { calculatePriorityAssessments } from '../services/priorityService';
import { generateCandidateProjects } from '../services/projectService';
import {
  simulateImpact,
  DOMAIN_DEMAND_RESPONSIVENESS,
  PRESET_SCENARIOS,
} from '../services/impactSimulationService';
import { SYNTHETIC_CITIZEN_REPORTS } from '../data/syntheticCitizenReports';
import { PROTOTYPE_STATES } from '../data/locations';

interface DemandIntelligenceSectionProps {
  liveSubmissions?: LiveCitizenRecord[];
  liveSubmission?: CitizenSubmission | null;
  liveInterpretation?: CitizenAIInterpretation | null;
  onNavigate?: (path: string) => void;
}

const ALL_DOMAINS: CivicCategory[] = [
  'Roads & Mobility',
  'Water Access',
  'Healthcare Access',
  'Electricity & Power',
  'School Facilities',
];

const GAP_LEVELS: GapLevel[] = ['Very High', 'High', 'Moderate', 'Low'];

const PRIORITY_BANDS: PriorityBand[] = [
  'Critical Signal',
  'High Signal',
  'Moderate Signal',
  'Emerging Signal',
];

export const DemandIntelligenceSection: React.FC<DemandIntelligenceSectionProps> = ({
  liveSubmissions,
  liveSubmission,
  liveInterpretation,
  onNavigate,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedGapLevel, setSelectedGapLevel] = useState<string>('All');
  const [selectedPriorityBand, setSelectedPriorityBand] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<
    'simulation' | 'projects' | 'priorities' | 'gaps' | 'hotspots' | 'clusters'
  >('simulation');
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  // Simulator Scenario State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [interventionCoverage, setInterventionCoverage] = useState<number>(60);
  const [implementationEffectiveness, setImplementationEffectiveness] = useState<number>(75);
  const [activePreset, setActivePreset] = useState<'conservative' | 'balanced' | 'highCoverage' | 'custom'>('balanced');

  // 1. Direct session live list strictly from liveSubmissions (deduplicated by id, immune to filters)
  const sessionLiveList: LiveCitizenRecord[] = useMemo(() => {
    const listMap = new Map<string, LiveCitizenRecord>();
    const syntheticIdSet = new Set(SYNTHETIC_CITIZEN_REPORTS.map((r) => r.submission.id));

    if (liveSubmissions && liveSubmissions.length > 0) {
      for (const item of liveSubmissions) {
        if (item && item.submission && !syntheticIdSet.has(item.submission.id)) {
          listMap.set(item.submission.id, item);
        }
      }
    }
    if (liveSubmission && !syntheticIdSet.has(liveSubmission.id) && !listMap.has(liveSubmission.id)) {
      listMap.set(liveSubmission.id, {
        submission: liveSubmission,
        interpretation: liveInterpretation || null,
        status: liveInterpretation ? 'INTERPRETED' : 'PENDING_INTERPRETATION',
      });
    }

    const liveArr = Array.from(listMap.values());

    console.log('[Runtime Trace 6 - DemandIntelligenceSection: sessionLiveList]', {
      liveSubmissionsPropsCount: liveSubmissions?.length || 0,
      sessionLiveCount: liveArr.length,
      sessionLiveList: liveArr.map((r) => ({
        id: r.submission.id,
        status: r.status,
        hasInterpretation: !!r.interpretation,
        district: r.submission.location.districtName,
        category: r.submission.category,
        text: r.submission.text,
      })),
    });

    return liveArr;
  }, [liveSubmissions, liveSubmission, liveInterpretation]);

  // 2. All citizen reports (synthetic + live), deduplicated by submission ID
  const allCitizenReports: CitizenSubmission[] = useMemo(() => {
    const reportMap = new Map<string, CitizenSubmission>();
    for (const item of SYNTHETIC_CITIZEN_REPORTS) {
      reportMap.set(item.submission.id, item.submission);
    }
    for (const item of sessionLiveList) {
      reportMap.set(item.submission.id, item.submission);
    }
    return Array.from(reportMap.values());
  }, [sessionLiveList]);

  // 3. Track explicit live counts and interpretation states
  const liveStats = useMemo(() => {
    const totalLive = sessionLiveList.length;
    const interpretedLive = sessionLiveList.filter((r) => r.interpretation !== null && r.status === 'INTERPRETED').length;
    const pendingLive = sessionLiveList.filter((r) => r.status === 'PENDING_INTERPRETATION').length;
    const failedLive = sessionLiveList.filter((r) => r.status === 'FAILED').length;

    return { totalLive, interpretedLive, pendingLive, failedLive };
  }, [sessionLiveList]);

  // 4. ONLY submissions with a real CitizenAIInterpretation participate in downstream analytics
  const interpretedReports: SubmissionWithInterpretation[] = useMemo(() => {
    const recordsMap = new Map<string, SubmissionWithInterpretation>();
    
    // Seed with synthetic reports (all have verified synthetic interpretations)
    for (const item of SYNTHETIC_CITIZEN_REPORTS) {
      recordsMap.set(item.submission.id, item);
    }

    // Merge ONLY live submissions that have a real, verified CitizenAIInterpretation
    for (const item of sessionLiveList) {
      if (item.interpretation && item.status === 'INTERPRETED') {
        recordsMap.set(item.submission.id, {
          submission: item.submission,
          interpretation: item.interpretation,
        });
      }
    }

    const syntheticItems: SubmissionWithInterpretation[] = [];
    const liveItems: SubmissionWithInterpretation[] = [];
    const syntheticIdSet = new Set(SYNTHETIC_CITIZEN_REPORTS.map((r) => r.submission.id));

    for (const [id, item] of recordsMap.entries()) {
      if (syntheticIdSet.has(id)) {
        syntheticItems.push(item);
      } else {
        liveItems.push(item);
      }
    }

    return [...liveItems, ...syntheticItems];
  }, [sessionLiveList]);

  // 1. Compute deterministic clusters (Stage 3) - strictly using real interpreted reports
  const allClusters: DemandCluster[] = useMemo(() => {
    return clusterCitizenSubmissions(interpretedReports);
  }, [interpretedReports]);

  // 2. Derive demand hotspots (Stage 4)
  const allHotspots: DemandHotspot[] = useMemo(() => {
    return deriveDemandHotspots(allClusters);
  }, [allClusters]);

  // 3. Calculate Development Gaps (Stage 6)
  const allGaps: DevelopmentGap[] = useMemo(() => {
    return calculateDevelopmentGaps(allHotspots);
  }, [allHotspots]);

  // 4. Calculate Explainable Priority Assessments (Stage 7)
  const allPriorities: PriorityAssessment[] = useMemo(() => {
    return calculatePriorityAssessments(allGaps, allHotspots);
  }, [allGaps, allHotspots]);

  // 5. Generate Candidate Development Projects (Stage 8)
  const allProjects: CandidateProject[] = useMemo(() => {
    return generateCandidateProjects(allPriorities);
  }, [allPriorities]);

  // Filter Priorities
  const filteredPriorities = useMemo(() => {
    return allPriorities.filter((p) => {
      const matchDomain = selectedDomain === 'All' || p.civicDomain === selectedDomain;
      const matchState = selectedState === 'All' || p.stateId === selectedState;
      const matchBand = selectedPriorityBand === 'All' || p.priorityBand === selectedPriorityBand;
      return matchDomain && matchState && matchBand;
    });
  }, [allPriorities, selectedDomain, selectedState, selectedPriorityBand]);

  // Filter Projects (Traceable to Priorities)
  const filteredProjects = useMemo(() => {
    const matchingPriorityIds = new Set(filteredPriorities.map((p) => p.id));
    return allProjects.filter((proj) => matchingPriorityIds.has(proj.priorityAssessmentId));
  }, [allProjects, filteredPriorities]);

  // Filter Gaps
  const filteredGaps = useMemo(() => {
    return allGaps.filter((g) => {
      const matchDomain = selectedDomain === 'All' || g.civicDomain === selectedDomain;
      const matchState = selectedState === 'All' || g.stateId === selectedState;
      const matchLevel = selectedGapLevel === 'All' || g.gapLevel === selectedGapLevel;
      return matchDomain && matchState && matchLevel;
    });
  }, [allGaps, selectedDomain, selectedState, selectedGapLevel]);

  // Filter Clusters
  const filteredClusters = useMemo(() => {
    return allClusters.filter((c) => {
      const matchDomain = selectedDomain === 'All' || c.civicDomain === selectedDomain;
      const matchState =
        selectedState === 'All' || c.locations.some((loc) => loc.stateId === selectedState);
      return matchDomain && matchState;
    });
  }, [allClusters, selectedDomain, selectedState]);

  // Filter Hotspots
  const filteredHotspots = useMemo(() => {
    return allHotspots.filter((h) => {
      const matchDomain = selectedDomain === 'All' || h.domain === selectedDomain;
      const matchState = selectedState === 'All' || h.stateId === selectedState;
      return matchDomain && matchState;
    });
  }, [allHotspots, selectedDomain, selectedState]);

  // Ensure selectedProjectId is synchronized with available filtered projects
  useEffect(() => {
    if (filteredProjects.length > 0) {
      const exists = filteredProjects.some((p) => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectId(filteredProjects[0].id);
      }
    } else {
      setSelectedProjectId('');
    }
  }, [filteredProjects, selectedProjectId]);

  // Current selected project for simulation
  const currentSimProject = useMemo(() => {
    return filteredProjects.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null;
  }, [filteredProjects, selectedProjectId]);

  const currentSimPriority = useMemo(() => {
    if (!currentSimProject) return null;
    return allPriorities.find((p) => p.id === currentSimProject.priorityAssessmentId) || null;
  }, [currentSimProject, allPriorities]);

  const currentSimGap = useMemo(() => {
    if (!currentSimProject) return null;
    return allGaps.find((g) => g.id === currentSimProject.developmentGapId) || null;
  }, [currentSimProject, allGaps]);

  // Perform deterministic simulation
  const simulationResult: ImpactSimulationResult | null = useMemo(() => {
    if (!currentSimProject || !currentSimPriority || !currentSimGap) return null;

    const scenario: ImpactScenario = {
      id: `sim-${currentSimProject.id}-${interventionCoverage}-${implementationEffectiveness}`,
      candidateProjectId: currentSimProject.id,
      priorityAssessmentId: currentSimPriority.id,
      developmentGapId: currentSimGap.id,
      interventionCoverage,
      implementationEffectiveness,
      scenarioName: activePreset,
    };

    return simulateImpact(currentSimProject, currentSimPriority, currentSimGap, scenario);
  }, [currentSimProject, currentSimPriority, currentSimGap, interventionCoverage, implementationEffectiveness, activePreset]);

  const handleApplyPreset = (presetKey: 'conservative' | 'balanced' | 'highCoverage') => {
    const config = PRESET_SCENARIOS[presetKey];
    setInterventionCoverage(config.coverage);
    setImplementationEffectiveness(config.effectiveness);
    setActivePreset(presetKey);
  };

  const handleCoverageChange = (val: number) => {
    setInterventionCoverage(val);
    checkCustomPreset(val, implementationEffectiveness);
  };

  const handleEffectivenessChange = (val: number) => {
    setImplementationEffectiveness(val);
    checkCustomPreset(interventionCoverage, val);
  };

  const checkCustomPreset = (cov: number, eff: number) => {
    if (cov === 40 && eff === 60) setActivePreset('conservative');
    else if (cov === 60 && eff === 75) setActivePreset('balanced');
    else if (cov === 80 && eff === 85) setActivePreset('highCoverage');
    else setActivePreset('custom');
  };

  const toggleClusterExpand = (clusterId: string) => {
    setExpandedClusterId((prev) => (prev === clusterId ? null : clusterId));
  };

  const isFiltered =
    selectedDomain !== 'All' ||
    selectedState !== 'All' ||
    selectedGapLevel !== 'All' ||
    selectedPriorityBand !== 'All';

  // Metrics for Projects View
  const displayedProjects = filteredProjects;
  const criticalProjectsCount = displayedProjects.filter(
    (p) => p.supportingEvidence.priorityScore >= 75
  ).length;
  const domainsCoveredCount = new Set(displayedProjects.map((p) => p.civicDomain)).size;
  const districtsCoveredCount = new Set(displayedProjects.map((p) => p.districtId)).size;

  // Metrics for Priorities View
  const displayedPriorities = filteredPriorities;
  const criticalSignalsCount = displayedPriorities.filter((p) => p.priorityBand === 'Critical Signal').length;
  const highSignalsCount = displayedPriorities.filter((p) => p.priorityBand === 'High Signal').length;
  const avgPriorityScore = displayedPriorities.length > 0
    ? Math.round(displayedPriorities.reduce((acc, p) => acc + p.priorityScore, 0) / displayedPriorities.length)
    : 0;

  // Metrics for Gaps View
  const displayedGaps = filteredGaps;
  const highGapsCount = displayedGaps.filter((g) => g.gapLevel === 'Very High' || g.gapLevel === 'High').length;
  const avgGapScore = displayedGaps.length > 0
    ? Math.round(displayedGaps.reduce((acc, g) => acc + g.developmentGapScore, 0) / displayedGaps.length)
    : 0;

  return (
    <section className="space-y-8" aria-label="Development Intelligence and Impact Simulation">
      {/* ========================================================================= */}
      {/* 0. DEDICATED UNCONDITIONAL LIVE CITIZEN INPUT SECTION                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-mono uppercase tracking-wider text-stone-900 font-bold">
              LIVE CITIZEN INPUT
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
              {sessionLiveList.length > 0
                ? `+${sessionLiveList.length} Live Citizen ${sessionLiveList.length === 1 ? 'Voice' : 'Voices'}`
                : '0 Live Submissions'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Session-level direct live citizen input stream · Unconditionally displayed
          </span>
        </div>

        {sessionLiveList.length === 0 ? (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70 text-center space-y-1">
            <p className="text-xs font-medium text-stone-600">
              No live citizen reports submitted in this session yet.
            </p>
            <p className="text-[11px] text-stone-400 font-mono">
              Share a community need via Voice or Text to see it immediately appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionLiveList.map((liveRecord, idx) => {
              const { submission, interpretation, status } = liveRecord;
              const isInterpreted = status === 'INTERPRETED' && !!interpretation;
              const isFailed = status === 'FAILED';

              return (
                <div
                  key={submission.id || `live-${idx}`}
                  className="p-4 rounded-xl bg-[#FAF9F5] border border-stone-200/80 shadow-2xs space-y-2.5 transition-all"
                >
                  {/* Card Header: Live Tag, Location, Category, Gemini Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#0F766E] text-white font-mono font-bold text-[10px] tracking-wide">
                        [LIVE] #{idx + 1}
                      </span>
                      <span className="font-semibold text-stone-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-stone-500">location_on</span>
                        {submission.location.districtName}, {submission.location.stateName}
                        {submission.location.locality ? ` (${submission.location.locality})` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700 font-mono text-[11px]">
                        {submission.category}
                      </span>
                      <span className="text-stone-400 text-[10px] font-mono uppercase">
                        {submission.language.toUpperCase()} · {submission.inputMode}
                      </span>
                    </div>

                    {/* Gemini Status Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {isInterpreted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Gemini: Interpreted
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Gemini: Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                          Gemini: Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Citizen Text Body */}
                  <div className="p-3 rounded-lg bg-white border border-stone-200/70 text-xs text-stone-800 font-sans leading-relaxed">
                    <span className="font-semibold text-stone-500 font-mono text-[10px] block mb-0.5">CITIZEN TESTIMONY:</span>
                    "{submission.text}"
                  </div>

                  {/* If interpreted by Gemini, show real AI primary issue & domain tags without fabricating */}
                  {isInterpreted && interpretation && (
                    <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-200/60 text-xs text-teal-900 font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#0F766E]">
                          Structured AI Issue: {interpretation.primaryIssue}
                        </span>
                        <span className="text-[10px] text-teal-700">
                          Severity: {interpretation.severity} · Urgency: {interpretation.urgency}
                        </span>
                      </div>
                      {interpretation.entitiesOrSignals && interpretation.entitiesOrSignals.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {interpretation.entitiesOrSignals.slice(0, 5).map((sig, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.2 rounded bg-white border border-teal-200 text-[10px] text-teal-800">
                              {sig}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. Pipeline Flow Ribbon (Visualizing all 9 Stages) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#444653] font-semibold">
            End-to-End Intelligence Pipeline
          </p>
          <span className="text-[10px] font-mono text-[#033aaf] font-bold">Update 08 · Impact Simulation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-xs font-mono">
          {/* Stage 1 */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 relative">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-stone-400 font-bold block">STAGE 1</span>
              {liveStats.totalLive > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                  +{liveStats.totalLive} Live
                </span>
              )}
            </div>
            <p className="text-stone-800 font-bold text-xs">{allCitizenReports.length} Voices</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Citizen voices</p>
          </div>

          {/* Stage 2 */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 relative">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#0F766E] font-bold block">STAGE 2</span>
              {liveStats.interpretedLive > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[8px] font-mono font-bold">
                  +{liveStats.interpretedLive} Real AI
                </span>
              )}
            </div>
            <p className="text-stone-800 font-bold text-xs">{interpretedReports.length} AI Signals</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Domain & severity</p>
          </div>

          {/* Stage 3 */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[9px] text-[#033aaf] font-bold block">STAGE 3</span>
            <p className="text-[#033aaf] font-bold text-xs">{allClusters.length} Clusters</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Semantic grouping</p>
          </div>

          {/* Stage 4 */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70">
            <span className="text-[9px] text-[#E06D28] font-bold block">STAGE 4</span>
            <p className="text-[#E06D28] font-bold text-xs">{allHotspots.length} Hotspots</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">District volume</p>
          </div>

          {/* Stage 5 */}
          <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-200/60">
            <span className="text-[9px] text-purple-700 font-bold block">STAGE 5</span>
            <p className="text-purple-900 font-bold text-xs">Context</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Infra & demo baseline</p>
          </div>

          {/* Stage 6 */}
          <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-200/60">
            <span className="text-[9px] text-amber-700 font-bold block">STAGE 6</span>
            <p className="text-amber-900 font-bold text-xs">{allGaps.length} Gaps</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Gap index</p>
          </div>

          {/* Stage 7 */}
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-200/70">
            <span className="text-[9px] text-[#033aaf] font-bold block">STAGE 7</span>
            <p className="text-[#033aaf] font-bold text-xs">{allPriorities.length} Priorities</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Priority signals</p>
          </div>

          {/* Stage 8 */}
          <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
            <span className="text-[9px] text-emerald-700 font-bold block">STAGE 8</span>
            <p className="text-emerald-900 font-bold text-xs">{allProjects.length} Projects</p>
            <p className="text-[10px] text-stone-500 font-sans truncate">Candidate options</p>
          </div>

          {/* Stage 9 */}
          <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-300 ring-1 ring-indigo-400/50">
            <span className="text-[9px] text-indigo-700 font-bold block">STAGE 9</span>
            <p className="text-indigo-900 font-bold text-xs">Simulator</p>
            <p className="text-[10px] text-indigo-700 font-sans truncate font-semibold">Impact model</p>
          </div>
        </div>

        {/* Live Citizen Ingestion Status Banner */}
        {liveStats.totalLive > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-emerald-900 font-mono text-xs sm:text-sm">
                +{liveStats.totalLive} Live Citizen {liveStats.totalLive === 1 ? 'Voice' : 'Voices'} Active in Session
              </span>
              <span className="text-emerald-700 font-sans">
                ({liveStats.interpretedLive} AI interpreted
                {liveStats.pendingLive > 0 ? `, ${liveStats.pendingLive} awaiting interpretation` : ''}
                {liveStats.failedLive > 0 ? `, ${liveStats.failedLive} failed` : ''})
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('clusters')}
                className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 transition cursor-pointer"
                type="button"
              >
                View Demand Clusters →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Metric Strip */}
      {activeTab === 'simulation' && simulationResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Projected Gap Reduction
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                Scenario Model
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-indigo-700 tracking-tight">
              -{simulationResult.projected.developmentGapReduction.toFixed(1)}{' '}
              <span className="text-sm font-normal text-stone-500">pts</span>
            </div>
            <p className="text-xs text-stone-500">
              {simulationResult.impact.gapReductionPercent.toFixed(1)}% reduction from baseline ({simulationResult.baseline.developmentGapScore} → {simulationResult.projected.projectedGapScore.toFixed(1)})
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Modeled Demand Reduction
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#033aaf] text-[10px] font-mono font-bold">
                Demand Signal
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-[#033aaf] tracking-tight">
              {simulationResult.impact.demandReductionPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-stone-500">
              Domain responsiveness coeff: {DOMAIN_DEMAND_RESPONSIVENESS[currentSimProject?.civicDomain || 'Other']?.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Infra Need Improvement
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                Baseline Need
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-amber-800 tracking-tight">
              {simulationResult.impact.infrastructureImprovementPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-stone-500">
              Modeled improvement in infrastructure deficit component
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Effective Scenario Reach
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                Coverage × Eff
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-800 tracking-tight">
              {simulationResult.impact.serviceReachPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-stone-500">
              {interventionCoverage}% coverage × {implementationEffectiveness}% effectiveness
            </p>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Candidate Projects
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                {isFiltered ? 'Filtered View' : 'Deterministic'}
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-stone-900 tracking-tight">
              {displayedProjects.length}
            </div>
            <p className="text-xs text-stone-500">
              {isFiltered
                ? `Filtered from ${allProjects.length} candidate interventions`
                : '1:1 mapped to ranked priority signals'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Critical-Signal Interventions
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                Priority ≥ 75
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-red-700 tracking-tight">
              {criticalProjectsCount}
            </div>
            <p className="text-xs text-stone-500">
              {isFiltered
                ? `${criticalProjectsCount} of ${displayedProjects.length} filtered candidate options`
                : 'Projects targeting highest priority demand signals'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Civic Domains Covered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#033aaf] text-[10px] font-mono font-bold">
                Sectors
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-[#033aaf] tracking-tight">
              {domainsCoveredCount}
            </div>
            <p className="text-xs text-stone-500">
              Across roads, water, health, power &amp; education
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Districts Covered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-bold">
                Geography
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-stone-900 tracking-tight">
              {districtsCoveredCount}
            </div>
            <p className="text-xs text-stone-500">
              Prototype coverage in WB, BR, and OD
            </p>
          </div>
        </div>
      )}

      {activeTab !== 'simulation' && activeTab !== 'projects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Ranked Priority Signals
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#033aaf] text-[10px] font-mono font-bold">
                {isFiltered ? 'Filtered View' : 'Deterministic'}
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-[#1a1c1e] tracking-tight">
              {displayedPriorities.length}
            </div>
            <p className="text-xs text-stone-500">
              {isFiltered
                ? `Filtered from ${allPriorities.length} assessed priorities`
                : `Assessed across ${new Set(allPriorities.map((p) => p.districtId)).size} prototype districts`}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Critical Signals (Score ≥ 75)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                Acute Signal
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-red-700 tracking-tight">
              {criticalSignalsCount}
            </div>
            <p className="text-xs text-stone-500">
              {isFiltered
                ? `${criticalSignalsCount} of ${displayedPriorities.length} filtered priorities in critical band`
                : 'High demand intersecting large development gaps'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Average Priority Index
              </span>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-bold">
                {isFiltered ? 'Filtered Mean' : 'Composite Mean'}
              </span>
            </div>
            <div className="text-3xl font-mono font-bold text-stone-900 tracking-tight">
              {avgPriorityScore} <span className="text-xs font-normal text-stone-400">/ 100</span>
            </div>
            <p className="text-xs text-stone-500">
              {isFiltered
                ? `Arithmetic mean for ${displayedPriorities.length} filtered assessments`
                : '5-factor explainable composite score'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#444653] font-semibold">
                Citizen Demand Input
              </span>
              {liveStats.totalLive > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  +{liveStats.totalLive} Live {liveStats.totalLive === 1 ? 'Voice' : 'Voices'}
                  {liveStats.pendingLive > 0 && ` (${liveStats.pendingLive} pending)`}
                </span>
              )}
            </div>
            <div className="text-3xl font-mono font-bold text-[#033aaf] tracking-tight">
              {allCitizenReports.length} <span className="text-xs font-normal text-stone-500">Voices</span>
            </div>
            <p className="text-xs text-stone-500">Directly driving localized demand signals</p>
          </div>
        </div>
      )}

      {/* 3. Formula Transparency & Calculation Walkthrough */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#033aaf] text-[20px]">
              {activeTab === 'simulation' ? 'tune' : activeTab === 'projects' ? 'account_tree' : 'calculate'}
            </span>
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">
              {activeTab === 'simulation'
                ? 'Explainable Impact Simulation Mathematical Model'
                : activeTab === 'projects'
                ? 'Candidate Intervention Archetype Mapping Architecture'
                : 'How Development Intelligence is Calculated'}
            </h3>
          </div>
          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="text-xs text-[#033aaf] hover:underline font-mono flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span>{showFormulaModal ? 'Hide Methodology Details' : 'View Methodology Breakdown'}</span>
            <span className="material-symbols-outlined text-sm">
              {showFormulaModal ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {/* Formula Bar */}
        {activeTab === 'simulation' ? (
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-700 space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs">
                Gap Reduction
              </span>
              <span>=</span>
              <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#033aaf]">
                0.40 × (Demand Signal × Demand Reduction)
              </span>
              <span>+</span>
              <span className="px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                0.30 × (Infra Need × Infra Improvement)
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Where <em>Demand Reduction = Coverage × Effectiveness × Domain Responsiveness</em>, and <em>Infra Improvement = Coverage × Effectiveness × 0.85</em>.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-700 space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="px-2 py-1 rounded-md bg-white border border-stone-300 text-stone-900 shadow-2xs">
                Priority Score
              </span>
              <span>=</span>
              <span className="px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#033aaf]">
                0.30 × Demand Intensity
              </span>
              <span>+</span>
              <span className="px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-800">
                0.30 × Development Gap
              </span>
              <span>+</span>
              <span className="px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                0.15 × Urgency Weight
              </span>
              <span>+</span>
              <span className="px-2 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-800">
                0.15 × Geo Concentration
              </span>
              <span>+</span>
              <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                0.10 × Service Pressure
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Deterministic 5-factor multi-criteria prioritization model.
            </p>
          </div>
        )}

        {/* Expandable Explanation Details */}
        {showFormulaModal && activeTab === 'simulation' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs border-t border-stone-100 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1">
              <span className="font-mono font-bold text-indigo-900 block">1. Intervention Strength</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Coverage ({interventionCoverage}%) × Effectiveness ({implementationEffectiveness}%) = {( (interventionCoverage * implementationEffectiveness) / 100 ).toFixed(1)}% modeled intervention reach.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 space-y-1">
              <span className="font-mono font-bold text-[#033aaf] block">2. Domain Responsiveness</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Prototype assumptions: Roads (0.80), Water (0.75), Healthcare (0.70), Electricity (0.75), Education (0.70).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 space-y-1">
              <span className="font-mono font-bold text-amber-900 block">3. Component Contributions</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Only demand and infrastructure components are reduced; demographic pressure and investment gap remain conservative.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1">
              <span className="font-mono font-bold text-emerald-900 block">4. Residual Gap</span>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Projected residual gap is bounded: max(0, Baseline Gap − Gap Reduction), preventing negative values or double counting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Filter Bar & View Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: View Tabs */}
        <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-medium flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulation'
                ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            Impact Simulator
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'projects'
                ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">construction</span>
            Candidate Projects ({filteredProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'priorities'
                ? 'bg-white text-blue-800 font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">priority_high</span>
            Development Priorities ({filteredPriorities.length})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gaps'
                ? 'bg-white text-amber-800 font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">analytics</span>
            Development Gaps ({filteredGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hotspots'
                ? 'bg-white text-[#E06D28] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
            Demand Hotspots ({filteredHotspots.length})
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'clusters'
                ? 'bg-white text-[#033aaf] font-bold shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">workspaces</span>
            Demand Clusters ({filteredClusters.length})
          </button>
        </div>

        {/* Right: Priority Band / Gap Level, Domain & State Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Priority Band Filter */}
          {(activeTab === 'simulation' || activeTab === 'projects' || activeTab === 'priorities') && (
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="font-mono text-[11px] text-stone-400 uppercase">Priority Band:</span>
              <select
                value={selectedPriorityBand}
                onChange={(e) => setSelectedPriorityBand(e.target.value)}
                className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 outline-none focus:outline-none focus:border-stone-900"
              >
                <option value="All">All Priority Bands</option>
                {PRIORITY_BANDS.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Domain Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-mono text-[11px] text-stone-400 uppercase">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 outline-none focus:outline-none focus:border-stone-900"
            >
              <option value="All">All Domains</option>
              {ALL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="font-mono text-[11px] text-stone-400 uppercase">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 outline-none focus:outline-none focus:border-stone-900"
            >
              <option value="All">All States</option>
              {PROTOTYPE_STATES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedDomain !== 'All' || selectedState !== 'All' || selectedGapLevel !== 'All' || selectedPriorityBand !== 'All') && (
            <button
              onClick={() => {
                setSelectedDomain('All');
                setSelectedState('All');
                setSelectedGapLevel('All');
                setSelectedPriorityBand('All');
              }}
              className="text-xs text-[#033aaf] hover:underline font-mono cursor-pointer"
              type="button"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. Main Content Views */}

      {/* VIEW 0: IMPACT SIMULATOR (UPDATE 08 CORE) */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Interactive Development Impact Simulation Engine
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Model hypothetical intervention scenarios and evaluate projected residual development gaps
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold self-start sm:self-auto">
              Hypothetical Scenario Model
            </span>
          </div>

          {filteredProjects.length === 0 || !simulationResult || !currentSimProject ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">search_off</span>
              <p className="text-base font-semibold text-stone-800">No candidate projects match filter criteria</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Reset active filters above to select candidate projects for impact simulation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Simulator Card 1: Project Selector & Baseline Context */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-semibold">
                      Select Target Candidate Project to Simulate:
                    </span>
                    <select
                      value={currentSimProject.id}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full max-w-2xl bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 outline-none focus:border-[#033aaf] focus:bg-white transition"
                    >
                      {filteredProjects.map((p, idx) => (
                        <option key={p.id} value={p.id}>
                          #{idx + 1} [{p.civicDomain}] {p.projectTitle} (Priority: {p.supportingEvidence.priorityScore}/100, Gap: {p.supportingEvidence.developmentGapScore}/100)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono">
                      <span className="text-[9px] text-stone-400 block uppercase">Priority Signal</span>
                      <span className="font-bold text-[#033aaf] text-base">{currentSimProject.supportingEvidence.priorityScore} / 100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono">
                      <span className="text-[9px] text-stone-400 block uppercase">Baseline Gap</span>
                      <span className="font-bold text-red-700 text-base">{currentSimProject.supportingEvidence.developmentGapScore} / 100</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono">
                      <span className="text-[9px] text-stone-400 block uppercase">Citizen Voices</span>
                      <span className="font-bold text-stone-800 text-base">{currentSimProject.supportingEvidence.reportCount} Reports</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-stone-600 leading-relaxed">
                  <span className="font-bold text-stone-800 font-mono text-[11px] uppercase mr-2">Target Need:</span>
                  {currentSimProject.targetNeed}
                </div>
              </div>

              {/* Simulator Card 2: Interactive Scenario Assumptions (Sliders & Presets) */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-indigo-700">tune</span>
                      Scenario Assumptions &amp; Model Controls
                    </h4>
                    <p className="text-xs text-stone-500 font-mono">
                      Modify hypothetical intervention parameters to calculate projected scenario outcomes in real time
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-medium shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('conservative')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        activePreset === 'conservative'
                          ? 'bg-white text-stone-900 font-bold shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Conservative (40/60)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('balanced')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        activePreset === 'balanced'
                          ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Balanced (60/75)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('highCoverage')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        activePreset === 'highCoverage'
                          ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      High Coverage (80/85)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider 1: Intervention Coverage */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="coverage-slider" className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider">
                        1. Intervention Coverage
                      </label>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-mono font-bold text-xs">
                        {interventionCoverage}%
                      </span>
                    </div>
                    <input
                      id="coverage-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={interventionCoverage}
                      onChange={(e) => handleCoverageChange(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
                    />
                    <p className="text-[11px] text-stone-500 font-sans">
                      Hypothetical proportion of identified deficit area addressed by intervention.
                    </p>
                  </div>

                  {/* Slider 2: Implementation Effectiveness */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="effectiveness-slider" className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider">
                        2. Implementation Effectiveness
                      </label>
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#033aaf] font-mono font-bold text-xs">
                        {implementationEffectiveness}%
                      </span>
                    </div>
                    <input
                      id="effectiveness-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={implementationEffectiveness}
                      onChange={(e) => handleEffectivenessChange(Number(e.target.value))}
                      className="w-full accent-[#033aaf] cursor-pointer h-2 bg-stone-200 rounded-lg"
                    />
                    <p className="text-[11px] text-stone-500 font-sans">
                      Hypothetical performance against targeted need under local operating conditions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulator Card 3: Before vs After Scenario Comparison */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#033aaf]">compare_arrows</span>
                    Before vs. Projected Scenario Comparison
                  </h4>
                  <span className="text-[11px] font-mono text-stone-500">
                    Modeled Result ({activePreset.toUpperCase()})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Baseline State */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600">
                        Baseline State (Pre-Intervention)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono font-bold">
                        Audited
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-stone-600">Development Gap Index:</span>
                          <span className="font-bold text-red-700">{simulationResult.baseline.developmentGapScore} / 100</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div style={{ width: `${simulationResult.baseline.developmentGapScore}%` }} className="bg-red-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-stone-600">Citizen Demand Signal:</span>
                          <span className="font-bold text-[#033aaf]">{Math.round(simulationResult.baseline.demandSignal * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${simulationResult.baseline.demandSignal * 100}%` }} className="bg-[#033aaf] h-full rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-stone-600">Infrastructure Need:</span>
                          <span className="font-bold text-amber-800">{Math.round(simulationResult.baseline.infrastructureNeed * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${simulationResult.baseline.infrastructureNeed * 100}%` }} className="bg-amber-600 h-full rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Projected Scenario State */}
                  <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-indigo-950">
                        Projected Scenario (Post-Intervention)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                        Modeled
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-indigo-950 font-semibold">Residual Development Gap:</span>
                          <span className="font-bold text-indigo-900">
                            {simulationResult.projected.projectedGapScore.toFixed(1)} / 100
                            <span className="text-emerald-700 font-normal ml-1">
                              (-{simulationResult.projected.developmentGapReduction.toFixed(1)} pts)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div style={{ width: `${simulationResult.projected.projectedGapScore}%` }} className="bg-indigo-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-stone-700">Modeled Demand Reduction:</span>
                          <span className="font-bold text-emerald-800">-{simulationResult.impact.demandReductionPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${simulationResult.impact.demandReductionPercent}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-stone-700">Modeled Infra Improvement:</span>
                          <span className="font-bold text-emerald-800">+{simulationResult.impact.infrastructureImprovementPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                          <div style={{ width: `${simulationResult.impact.infrastructureImprovementPercent}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Explanation Narrative */}
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-mono font-bold text-[11px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Scenario Calculation Walkthrough:
                  </div>
                  <p className="text-stone-700 leading-relaxed font-sans">
                    {simulationResult.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW A: CANDIDATE DEVELOPMENT PROJECTS (UPDATE 07 CORE) */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Candidate Development Projects ({filteredProjects.length})
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Illustrative intervention pathways derived from observed development signals.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
              Synthetic Demonstration Data
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">search_off</span>
              <p className="text-base font-semibold text-stone-800">No candidate projects match filter criteria</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try selecting "All Priority Bands" or resetting the domain and state filters above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredProjects.map((project, index) => {
                const isCritical = project.supportingEvidence.priorityScore >= 75;
                const priorityBadgeClass = isCritical
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-orange-100 text-orange-800 border-orange-200';

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden p-6 space-y-5"
                  >
                    {/* Top Row: Ref, Location, Domain, Project Type, Linked Signals */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white text-xs font-mono font-bold">
                            PROJECT #{index + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#033aaf] uppercase">
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            {project.districtName}, {project.stateName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold">
                            {project.civicDomain}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold">
                            {project.projectType}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-stone-900">
                          {project.projectTitle}
                        </h4>
                      </div>

                      {/* Linked Priority & Gap Signals */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <div className={`p-2.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${priorityBadgeClass}`}>
                          <span className="material-symbols-outlined text-[16px]">priority_high</span>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider block font-sans">Priority Signal</span>
                            <span className="font-bold">{project.supportingEvidence.priorityScore} / 100</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-mono text-xs text-stone-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-stone-500">analytics</span>
                          <div>
                            <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-sans">Development Gap</span>
                            <span className="font-bold">{project.supportingEvidence.developmentGapScore} / 100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Description */}
                    <div className="text-xs text-stone-700 leading-relaxed font-sans">
                      {project.description}
                    </div>

                    {/* Target Development Need Box */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                      <span className="font-mono font-bold text-stone-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#033aaf]">target</span>
                        Target Development Need:
                      </span>
                      <p className="text-stone-700 leading-relaxed font-sans">
                        {project.targetNeed}
                      </p>
                    </div>

                    {/* Supporting Evidence Inherited Strip */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                        Underlying Signal Evidence
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs font-mono">
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Demand Volume</span>
                          <span className="font-bold text-stone-800">{project.supportingEvidence.reportCount} Reports</span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Severity Signal</span>
                          <span className="font-bold text-stone-800">{Math.round(project.supportingEvidence.severitySignal * 100)}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Urgency Signal</span>
                          <span className="font-bold text-stone-800">{Math.round(project.supportingEvidence.urgencySignal * 100)}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Infra Need</span>
                          <span className="font-bold text-amber-800">{Math.round(project.supportingEvidence.infrastructureNeed * 100)}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Demo Pressure</span>
                          <span className="font-bold text-purple-800">{Math.round(project.supportingEvidence.demographicPressure * 100)}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-50 border border-stone-200/60">
                          <span className="text-[9px] text-stone-400 block uppercase">Invest Gap</span>
                          <span className="font-bold text-emerald-800">{Math.round(project.supportingEvidence.investmentGap * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Rationale Box */}
                    <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#033aaf] font-mono font-bold text-[11px] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                        Candidate Intervention Rationale:
                      </div>
                      <p className="text-stone-700 leading-relaxed font-sans">
                        {project.rationale}
                      </p>
                    </div>

                    {/* Implementation Considerations List */}
                    <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-200/70 text-xs space-y-2">
                      <span className="font-mono font-bold text-stone-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-stone-500">checklist</span>
                        High-Level Implementation Considerations:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 font-sans">
                        {project.implementationConsiderations.map((consideration, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold text-xs mt-0.5">•</span>
                            <span>{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: EXPLAINABLE DEVELOPMENT PRIORITIES (UPDATE 06 CORE) */}
      {activeTab === 'priorities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Ranked Development Priorities ({filteredPriorities.length})
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Multi-factor deterministic ranking: Demand Intensity (30%) + Gap Index (30%) + Urgency (15%) + Geo Concentration (15%) + Service Pressure (10%)
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
              Synthetic Demonstration Model
            </span>
          </div>

          {filteredPriorities.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">search_off</span>
              <p className="text-base font-semibold text-stone-800">No development priorities match filter criteria</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try selecting "All Priority Bands" or resetting the domain and state filters above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredPriorities.map((item, index) => {
                const bandBadgeColor =
                  item.priorityBand === 'Critical Signal'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : item.priorityBand === 'High Signal'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : item.priorityBand === 'Moderate Signal'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200';

                const scoreBarColor =
                  item.priorityScore >= 75
                    ? 'bg-red-600'
                    : item.priorityScore >= 55
                    ? 'bg-orange-500'
                    : item.priorityScore >= 35
                    ? 'bg-amber-400'
                    : 'bg-blue-500';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden p-6 space-y-5"
                  >
                    {/* Top Row: Rank, Location, Domain, Priority Band & Score */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white text-xs font-mono font-bold">
                            RANK #{index + 1}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#033aaf] uppercase">
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            {item.districtName}, {item.stateName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold">
                            {item.civicDomain}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${bandBadgeColor}`}>
                            {item.priorityBand}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-stone-900">
                          {item.demandTitle}
                        </h4>
                      </div>

                      {/* Overall Priority Score Gauge */}
                      <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200 shrink-0 justify-between lg:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">Priority Signal Score</span>
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-2xl font-mono font-bold text-stone-900">{item.priorityScore}</span>
                            <span className="text-xs font-mono text-stone-400">/ 100</span>
                          </div>
                        </div>
                        <div className="w-16 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            style={{ width: `${item.priorityScore}%` }}
                            className={`h-full rounded-full ${scoreBarColor}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5 Factor Component Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
                      {/* Factor 1: Demand Intensity (30%) */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">1. DEMAND INTENSITY (30%)</span>
                          <span className="font-bold text-[#033aaf]">{Math.round(item.factors.demandIntensity * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${item.factors.demandIntensity * 100}%` }} className="bg-[#033aaf] h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          {item.evidence.reportCount} {item.evidence.reportCount === 1 ? 'voice' : 'voices'}
                        </p>
                      </div>

                      {/* Factor 2: Development Gap (30%) */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">2. DEV GAP (30%)</span>
                          <span className="font-bold text-red-700">{Math.round(item.factors.developmentGap * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${item.factors.developmentGap * 100}%` }} className="bg-red-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Gap: {Math.round(item.factors.developmentGap * 100)}/100
                        </p>
                      </div>

                      {/* Factor 3: Urgency (15%) */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">3. URGENCY (15%)</span>
                          <span className="font-bold text-amber-800">{Math.round(item.factors.urgency * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${item.factors.urgency * 100}%` }} className="bg-amber-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Time risk profile
                        </p>
                      </div>

                      {/* Factor 4: Geographic Concentration (15%) */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">4. GEO CONC (15%)</span>
                          <span className="font-bold text-purple-800">{Math.round(item.factors.geographicConcentration * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${item.factors.geographicConcentration * 100}%` }} className="bg-purple-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Localized density
                        </p>
                      </div>

                      {/* Factor 5: Service Pressure (10%) */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">5. PRESSURE (10%)</span>
                          <span className="font-bold text-emerald-800">{Math.round(item.factors.servicePressure * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${item.factors.servicePressure * 100}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Demographic strain
                        </p>
                      </div>
                    </div>

                    {/* Underlying Evidence Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                        <span className="text-[10px] text-stone-400 block uppercase">Demand Volume</span>
                        <span className="font-bold text-stone-800">{item.evidence.reportCount} Reports</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                        <span className="text-[10px] text-stone-400 block uppercase">Severity Index</span>
                        <span className="font-bold text-stone-800">{Math.round(item.evidence.severitySignal * 100)}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                        <span className="text-[10px] text-stone-400 block uppercase">Baseline Coverage</span>
                        <span className="font-bold text-stone-800">{Math.round((1 - item.evidence.infrastructureNeed) * 100)}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60">
                        <span className="text-[10px] text-stone-400 block uppercase">Demographic Exposure</span>
                        <span className="font-bold text-stone-800">{Math.round(item.evidence.demographicPressure * 100)}%</span>
                      </div>
                    </div>

                    {/* Explainable Analytical Assessment Narrative Box */}
                    <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#033aaf] font-mono font-bold text-[11px] uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Analytical Priority Assessment:
                      </div>
                      <p className="text-stone-700 leading-relaxed font-sans">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW C: DEVELOPMENT GAPS (UPDATE 05 CORE) */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Development Gap Intelligence ({filteredGaps.length})
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Evaluates citizen demand signals against infrastructure deficiency, demographic vulnerability & investment coverage
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
              Synthetic Demonstration Data
            </span>
          </div>

          {filteredGaps.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">search_off</span>
              <p className="text-base font-semibold text-stone-800">No development gaps match filter criteria</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try selecting "All Gap Levels" or resetting the domain and state filters above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredGaps.map((gap) => {
                const badgeColor =
                  gap.gapLevel === 'Very High'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : gap.gapLevel === 'High'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : gap.gapLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                const scoreBarColor =
                  gap.developmentGapScore >= 75
                    ? 'bg-red-600'
                    : gap.developmentGapScore >= 55
                    ? 'bg-orange-500'
                    : gap.developmentGapScore >= 35
                    ? 'bg-amber-400'
                    : 'bg-emerald-500';

                return (
                  <div
                    key={gap.id}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden p-6 space-y-5"
                  >
                    {/* Top Row: Location, Domain, Gap Level Badge & Overall Score */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#033aaf] uppercase">
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            {gap.districtName}, {gap.stateName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold">
                            {gap.civicDomain}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${badgeColor}`}>
                            {gap.gapLevel} Gap
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-stone-900">
                          {gap.demandTitle}
                        </h4>
                        {gap.localities.length > 0 && (
                          <p className="text-[11px] text-stone-500 font-mono">
                            Localities Tracked: {gap.localities.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Overall Gap Score Gauge */}
                      <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200 shrink-0 justify-between lg:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">Development Gap Index</span>
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-2xl font-mono font-bold text-stone-900">{gap.developmentGapScore}</span>
                            <span className="text-xs font-mono text-stone-400">/ 100</span>
                          </div>
                        </div>
                        <div className="w-16 bg-stone-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            style={{ width: `${gap.developmentGapScore}%` }}
                            className={`h-full rounded-full ${scoreBarColor}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4 Factor Component Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                      {/* Factor 1: Demand Signal */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">1. DEMAND SIGNAL (40%)</span>
                          <span className="font-bold text-[#033aaf]">{Math.round(gap.demandSignal * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${gap.demandSignal * 100}%` }} className="bg-[#033aaf] h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          {gap.reportCount} {gap.reportCount === 1 ? 'citizen voice' : 'citizen voices'}
                        </p>
                      </div>

                      {/* Factor 2: Infrastructure Need */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">2. INFRA NEED (30%)</span>
                          <span className="font-bold text-amber-800">{Math.round(gap.infrastructureNeed * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${gap.infrastructureNeed * 100}%` }} className="bg-amber-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Baseline: {Math.round((1 - gap.infrastructureNeed) * 100)}% coverage
                        </p>
                      </div>

                      {/* Factor 3: Demographic Pressure */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">3. DEMO PRESSURE (20%)</span>
                          <span className="font-bold text-purple-800">{Math.round(gap.demographicPressure * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${gap.demographicPressure * 100}%` }} className="bg-purple-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          Seasonal & density exposure
                        </p>
                      </div>

                      {/* Factor 4: Investment Gap */}
                      <div className="p-3 rounded-xl bg-stone-50/70 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-bold text-[10px]">4. INVEST GAP (10%)</span>
                          <span className="font-bold text-emerald-800">{Math.round(gap.investmentGap * 100)}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div style={{ width: `${gap.investmentGap * 100}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                        <p className="text-[10px] text-stone-500 font-sans">
                          1 − Capital index: {Math.round(gap.investmentGap * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Context Explanation */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed font-sans">
                      <span className="font-semibold text-stone-800 font-mono text-[11px] block mb-1">
                        Development Context Analysis:
                      </span>
                      {gap.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW D: DEMAND HOTSPOTS */}
      {activeTab === 'hotspots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-900">
              Concentrated Demand Hotspots ({filteredHotspots.length})
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Where specific civic development demands are concentrated
            </p>
          </div>

          {filteredHotspots.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">location_off</span>
              <p className="text-base font-semibold text-stone-800">No demand hotspots found</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No localized demand hotspots match the active filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#E06D28] uppercase">
                        <span className="material-symbols-outlined text-[15px]">location_on</span>
                        {hotspot.district}, {hotspot.state}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-mono font-semibold">
                        {hotspot.domain}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900">
                      {hotspot.demandTitle}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {hotspot.normalizedDemand}
                    </p>

                    {hotspot.localities.length > 0 && (
                      <p className="text-[11px] text-stone-500 font-mono">
                        Key Localities: {hotspot.localities.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Citizen Demand Volume:</span>
                      <span className="font-mono font-bold text-stone-900 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#E06D28]">
                        {hotspot.reportCount} {hotspot.reportCount === 1 ? 'Voice' : 'Voices'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {hotspot.representativeSignals.slice(0, 4).map((sig) => (
                        <span
                          key={sig}
                          className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-600 font-mono"
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW E: DEMAND CLUSTERS */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-stone-900">
              Semantic Demand Clusters ({filteredClusters.length})
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Grouped by domain, problem theme & geographic corridor
            </p>
          </div>

          {filteredClusters.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200/80 space-y-3">
              <span className="material-symbols-outlined text-4xl text-stone-300">workspaces</span>
              <p className="text-base font-semibold text-stone-800">No demand clusters found</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try selecting a different civic domain or state filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredClusters.map((cluster) => {
                const isExpanded = expandedClusterId === cluster.id;
                const memberReports = interpretedReports.filter((r) =>
                  cluster.memberReportIds.includes(r.submission.id)
                );

                return (
                  <div
                    key={cluster.id}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => toggleClusterExpand(cluster.id)}
                      className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-stone-50/50"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#033aaf]/10 text-[#033aaf] text-[11px] font-mono font-bold">
                            {cluster.civicDomain}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">
                            {cluster.reportCount} {cluster.reportCount === 1 ? 'Report' : 'Reports'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900">
                          {cluster.title}
                        </h4>
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {cluster.normalizedDemand}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-stone-400 block uppercase">Signal Intensity</span>
                          <span className="text-base font-mono font-bold text-stone-800">
                            {Math.round(cluster.confidence * 100)}%
                          </span>
                        </div>
                        <button
                          type="button"
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                          aria-label={isExpanded ? 'Collapse cluster details' : 'Expand cluster details'}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-stone-100 bg-stone-50/40 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {/* Severity & Urgency Distribution */}
                          <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-3">
                            <h5 className="text-xs font-mono uppercase text-stone-600 font-semibold tracking-wider">
                              Severity &amp; Urgency Breakdown
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {cluster.severityDistribution.Critical > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-mono text-[11px]">
                                  Critical: {cluster.severityDistribution.Critical}
                                </span>
                              )}
                              {cluster.severityDistribution.High > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 font-mono text-[11px]">
                                  High: {cluster.severityDistribution.High}
                                </span>
                              )}
                              {cluster.severityDistribution.Medium > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[11px]">
                                  Medium: {cluster.severityDistribution.Medium}
                                </span>
                              )}
                              {cluster.severityDistribution.Low > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-mono text-[11px]">
                                  Low: {cluster.severityDistribution.Low}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {cluster.urgencyDistribution.Immediate > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-mono text-[11px]">
                                  Immediate: {cluster.urgencyDistribution.Immediate}
                                </span>
                              )}
                              {cluster.urgencyDistribution['Seasonal Risk'] > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[11px]">
                                  Seasonal: {cluster.urgencyDistribution['Seasonal Risk']}
                                </span>
                              )}
                              {cluster.urgencyDistribution.Routine > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 font-mono text-[11px]">
                                  Routine: {cluster.urgencyDistribution.Routine}
                                </span>
                              )}
                              {cluster.urgencyDistribution['Long-term'] > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[11px]">
                                  Long-term: {cluster.urgencyDistribution['Long-term']}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Geographic Concentration */}
                          <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-3">
                            <h5 className="text-xs font-mono uppercase text-stone-600 font-semibold tracking-wider">
                              Geographic Distribution
                            </h5>
                            <div className="space-y-2">
                              {cluster.locations.map((loc) => (
                                <div
                                  key={`${loc.stateId}-${loc.districtId}`}
                                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 border border-stone-200/60"
                                >
                                  <div>
                                    <span className="font-semibold text-stone-800">
                                      {loc.districtName}, {loc.stateName}
                                    </span>
                                    {loc.locality && (
                                      <p className="text-[11px] text-stone-500 font-mono">{loc.locality}</p>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-800 font-mono font-bold">
                                    {loc.reportCount} {loc.reportCount === 1 ? 'report' : 'reports'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Underlying Reports Excerpts */}
                        <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-3">
                          <h5 className="text-xs font-mono uppercase text-stone-600 font-semibold tracking-wider">
                            Sample Underlying Citizen Voices ({memberReports.length})
                          </h5>
                          <div className="space-y-2.5">
                            {memberReports.map((item) => (
                              <div
                                key={item.submission.id}
                                className="p-3 rounded-lg bg-stone-50/70 border border-stone-200/60 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                  <span>
                                    {item.submission.location.districtName}, {item.submission.location.stateName}
                                    {item.submission.location.locality ? ` · ${item.submission.location.locality}` : ''}
                                  </span>
                                  <span className="uppercase font-semibold text-stone-600">
                                    {item.submission.language.toUpperCase()} · {item.submission.inputMode}
                                  </span>
                                </div>
                                <p className="text-stone-800 italic">
                                  "{item.submission.text}"
                                </p>
                                <p className="text-[11px] text-stone-600 pt-1 font-mono">
                                  <span className="text-[#0F766E] font-semibold">AI Interpretation:</span>{' '}
                                  {item.interpretation.primaryIssue}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer Informational Disclaimer */}
      <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-[11px] font-mono text-stone-500 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-1.5 text-stone-600">
          <span className="material-symbols-outlined text-[15px] text-[#0F766E]">verified</span>
          Prototype Impact Simulation Model · Deterministic Scenario Calculation
        </span>
        <span>Scenario estimates are generated from prototype assumptions and synthetic demonstration data. They illustrate how outcomes could change under different assumptions; they are not measured real-world impacts or implementation forecasts. Domain responsiveness coefficients are prototype modeling assumptions, not empirical estimates.</span>
      </div>
    </section>
  );
};
