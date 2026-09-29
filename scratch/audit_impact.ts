import { SYNTHETIC_CITIZEN_REPORTS } from '../src/data/syntheticCitizenReports';
import { clusterCitizenSubmissions, deriveDemandHotspots } from '../src/services/clusteringService';
import { calculateDevelopmentGaps } from '../src/services/developmentGapService';
import { calculatePriorityAssessments } from '../src/services/priorityService';
import { generateCandidateProjects } from '../src/services/projectService';
import { simulateImpact, DOMAIN_DEMAND_RESPONSIVENESS } from '../src/services/impactSimulationService';

const clusters = clusterCitizenSubmissions(SYNTHETIC_CITIZEN_REPORTS);
const hotspots = deriveDemandHotspots(clusters);
const gaps = calculateDevelopmentGaps(hotspots);
const priorities = calculatePriorityAssessments(gaps, hotspots);
const projects = generateCandidateProjects(priorities);

console.log('--- AUDITING IMPACT SIMULATION ENGINE ---');

// 1. Test all 9 projects at default 60% coverage, 75% effectiveness
projects.forEach((proj, idx) => {
  const pri = priorities.find(p => p.id === proj.priorityAssessmentId)!;
  const gap = gaps.find(g => g.id === proj.developmentGapId)!;

  const result = simulateImpact(proj, pri, gap, {
    id: `scen-${proj.id}`,
    candidateProjectId: proj.id,
    priorityAssessmentId: pri.id,
    developmentGapId: gap.id,
    interventionCoverage: 60,
    implementationEffectiveness: 75,
  });

  console.log(`[Project #${idx + 1}] ${proj.projectTitle}`);
  console.log(`   Baseline Gap: ${result.baseline.developmentGapScore} | Projected Gap: ${result.projected.projectedGapScore.toFixed(1)} | Reduction: ${result.projected.developmentGapReduction.toFixed(1)} pts (${result.impact.gapReductionPercent.toFixed(1)}%)`);
  console.log(`   Demand Red: ${result.impact.demandReductionPercent.toFixed(1)}% | Infra Imp: ${result.impact.infrastructureImprovementPercent.toFixed(1)}% | Service Reach: ${result.impact.serviceReachPercent.toFixed(1)}%`);

  if (result.projected.projectedGapScore > result.baseline.developmentGapScore) {
    throw new Error(`Projected gap exceeded baseline for ${proj.id}`);
  }
  if (result.projected.projectedGapScore < 0) {
    throw new Error(`Projected gap is negative for ${proj.id}`);
  }
});

// 2. Edge Case Tests
const sampleProj = projects[0];
const samplePri = priorities.find(p => p.id === sampleProj.priorityAssessmentId)!;
const sampleGap = gaps.find(g => g.id === sampleProj.developmentGapId)!;

// A: 0% coverage
const resZeroCov = simulateImpact(sampleProj, samplePri, sampleGap, {
  id: 'scen-zero-cov',
  candidateProjectId: sampleProj.id,
  priorityAssessmentId: samplePri.id,
  developmentGapId: sampleGap.id,
  interventionCoverage: 0,
  implementationEffectiveness: 75,
});
console.log('\nEdge Case A (0% Coverage):', {
  gapReduction: resZeroCov.projected.developmentGapReduction,
  residualGap: resZeroCov.projected.residualDevelopmentGap,
  baselineGap: resZeroCov.baseline.developmentGapScore,
});
if (resZeroCov.projected.developmentGapReduction !== 0 || resZeroCov.projected.residualDevelopmentGap !== sampleGap.developmentGapScore) {
  throw new Error('Edge Case A failed!');
}

// B: 0% effectiveness
const resZeroEff = simulateImpact(sampleProj, samplePri, sampleGap, {
  id: 'scen-zero-eff',
  candidateProjectId: sampleProj.id,
  priorityAssessmentId: samplePri.id,
  developmentGapId: sampleGap.id,
  interventionCoverage: 60,
  implementationEffectiveness: 0,
});
console.log('Edge Case B (0% Effectiveness):', {
  gapReduction: resZeroEff.projected.developmentGapReduction,
  residualGap: resZeroEff.projected.residualDevelopmentGap,
});
if (resZeroEff.projected.developmentGapReduction !== 0 || resZeroEff.projected.residualDevelopmentGap !== sampleGap.developmentGapScore) {
  throw new Error('Edge Case B failed!');
}

// C: 100% coverage, 100% effectiveness
const resMax = simulateImpact(sampleProj, samplePri, sampleGap, {
  id: 'scen-max',
  candidateProjectId: sampleProj.id,
  priorityAssessmentId: samplePri.id,
  developmentGapId: sampleGap.id,
  interventionCoverage: 100,
  implementationEffectiveness: 100,
});
console.log('Edge Case C (100% / 100% Max):', {
  demandRed: resMax.impact.demandReductionPercent,
  infraImp: resMax.impact.infrastructureImprovementPercent,
  gapReduction: resMax.projected.developmentGapReduction,
  residualGap: resMax.projected.residualDevelopmentGap,
});

// D: Monotonicity test
let prevReduction = 0;
for (let c = 0; c <= 100; c += 10) {
  const r = simulateImpact(sampleProj, samplePri, sampleGap, {
    id: `scen-mono-${c}`,
    candidateProjectId: sampleProj.id,
    priorityAssessmentId: samplePri.id,
    developmentGapId: sampleGap.id,
    interventionCoverage: c,
    implementationEffectiveness: 75,
  });
  if (r.projected.developmentGapReduction < prevReduction - 0.0001) {
    throw new Error(`Monotonicity violation at coverage ${c}`);
  }
  prevReduction = r.projected.developmentGapReduction;
}

console.log('\nALL 11 SIMULATION AUDIT CHECKS PASSED PERFECTLY!');
