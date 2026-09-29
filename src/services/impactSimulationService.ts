/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidateProject } from '../types/project';
import { PriorityAssessment } from '../types/priority';
import { DevelopmentGap } from '../types/development';
import { ImpactScenario, ImpactSimulationResult } from '../types/impact';

/**
 * Prototype domain demand-responsiveness coefficients.
 * Note: These are model assumptions for demonstration, not empirical coefficients.
 */
export const DOMAIN_DEMAND_RESPONSIVENESS: Record<string, number> = {
  'Roads & Mobility': 0.80,
  'Water Access': 0.75,
  'Healthcare Access': 0.70,
  'Electricity & Power': 0.75,
  'School Facilities': 0.70,
  'Other': 0.60,
};

/**
 * Preset scenario configurations.
 */
export const PRESET_SCENARIOS = {
  conservative: {
    name: 'Conservative',
    coverage: 40,
    effectiveness: 60,
    description: 'Modest coverage (40%) with standard implementation performance (60%).',
  },
  balanced: {
    name: 'Balanced',
    coverage: 60,
    effectiveness: 75,
    description: 'Standard baseline scenario (60% coverage, 75% implementation effectiveness).',
  },
  highCoverage: {
    name: 'High Coverage',
    coverage: 80,
    effectiveness: 85,
    description: 'Ambitious scenario (80% coverage with high 85% implementation performance).',
  },
};

/**
 * Generates neutral, explainable narrative for the simulation result.
 */
function generateSimulationExplanation(
  coveragePct: number,
  effectivenessPct: number,
  combinedPct: number,
  domain: string,
  domainCoeff: number,
  demandRedPct: number,
  infraImpPct: number,
  baselineGap: number,
  gapRedPoints: number,
  residualGap: number
): string {
  return `At ${coveragePct}% intervention coverage and ${effectivenessPct}% modeled implementation effectiveness, the combined intervention strength is ${combinedPct.toFixed(1)}%. For ${domain}, the prototype demand-responsiveness coefficient is ${domainCoeff.toFixed(2)}, yielding a modeled demand reduction of ${demandRedPct.toFixed(1)}% and an infrastructure improvement of ${infraImpPct.toFixed(1)}%. This projects a Development Gap reduction of ${gapRedPoints.toFixed(1)} points (from ${baselineGap} to ${residualGap.toFixed(1)} / 100).`;
}

/**
 * Pure, deterministic impact simulation function.
 *
 * Same inputs -> identical outputs. No side effects, no randomness.
 */
export function simulateImpact(
  candidateProject: CandidateProject,
  priorityAssessment: PriorityAssessment,
  developmentGap: DevelopmentGap,
  scenario: ImpactScenario
): ImpactSimulationResult {
  // 1. Clamp scenario inputs strictly to [0, 100]
  const rawCoverage = Math.max(0, Math.min(100, Number.isFinite(scenario.interventionCoverage) ? scenario.interventionCoverage : 60));
  const rawEffectiveness = Math.max(0, Math.min(100, Number.isFinite(scenario.implementationEffectiveness) ? scenario.implementationEffectiveness : 75));

  const coverage = rawCoverage / 100;
  const effectiveness = rawEffectiveness / 100;

  // 2. Combined intervention strength in [0, 1]
  const combinedEffectiveness = coverage * effectiveness;

  // 3. Domain Demand Responsiveness coefficient
  const domain = candidateProject.civicDomain || 'Other';
  const domainResponsiveness = DOMAIN_DEMAND_RESPONSIVENESS[domain] ?? 0.60;

  // 4. Modeled reductions & improvements in [0, 1]
  const demandReduction = Math.max(0, Math.min(1.0, combinedEffectiveness * domainResponsiveness));
  const infrastructureImprovement = Math.max(0, Math.min(1.0, combinedEffectiveness * 0.85));
  const serviceReach = Math.max(0, Math.min(1.0, coverage * effectiveness));

  // 5. Component Impacts
  const existingDemand = Math.max(0, Math.min(1.0, developmentGap.demandSignal));
  const existingInfraNeed = Math.max(0, Math.min(1.0, developmentGap.infrastructureNeed));

  const demandImpact = existingDemand * demandReduction;
  const infraImpact = existingInfraNeed * infrastructureImprovement;

  // 6. Development Gap Reduction points: (0.40 * demandImpact + 0.30 * infraImpact) * 100
  const gapReduction = (0.40 * demandImpact + 0.30 * infraImpact) * 100;

  // 7. Projected residual development gap
  const baselineGapScore = Math.max(0, Math.min(100, developmentGap.developmentGapScore));
  const projectedGapScore = Math.max(0, Math.min(100, baselineGapScore - gapReduction));
  const residualDevelopmentGap = projectedGapScore;

  // 8. Percentage outcomes in [0, 100]
  const gapReductionPercent = baselineGapScore > 0 ? Math.min(100, (gapReduction / baselineGapScore) * 100) : 0;
  const demandReductionPercent = demandReduction * 100;
  const infrastructureImprovementPercent = infrastructureImprovement * 100;
  const serviceReachPercent = serviceReach * 100;

  // 9. Explainable narrative
  const explanation = generateSimulationExplanation(
    rawCoverage,
    rawEffectiveness,
    combinedEffectiveness * 100,
    domain,
    domainResponsiveness,
    demandReductionPercent,
    infrastructureImprovementPercent,
    baselineGapScore,
    gapReduction,
    residualDevelopmentGap
  );

  return {
    scenario: {
      ...scenario,
      interventionCoverage: rawCoverage,
      implementationEffectiveness: rawEffectiveness,
    },
    baseline: {
      developmentGapScore: baselineGapScore,
      priorityScore: priorityAssessment.priorityScore,
      demandSignal: developmentGap.demandSignal,
      infrastructureNeed: developmentGap.infrastructureNeed,
      demographicPressure: developmentGap.demographicPressure,
      investmentGap: developmentGap.investmentGap,
      reportCount: developmentGap.reportCount,
    },
    projected: {
      demandReduction,
      infrastructureImprovement,
      serviceReach,
      developmentGapReduction: gapReduction,
      residualDevelopmentGap,
      projectedGapScore,
    },
    impact: {
      gapReductionPercent,
      demandReductionPercent,
      serviceReachPercent,
      infrastructureImprovementPercent,
    },
    explanation,
    dataQuality: 'Synthetic Demonstration Data',
  };
}
