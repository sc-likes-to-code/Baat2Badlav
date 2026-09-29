/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImpactScenario {
  id: string;

  candidateProjectId: string;
  priorityAssessmentId: string;
  developmentGapId: string;

  interventionCoverage: number; // 0 to 100
  implementationEffectiveness: number; // 0 to 100

  scenarioName?: string;
}

export interface ImpactSimulationResult {
  scenario: ImpactScenario;

  baseline: {
    developmentGapScore: number;
    priorityScore: number;
    demandSignal: number;
    infrastructureNeed: number;
    demographicPressure: number;
    investmentGap: number;
    reportCount: number;
  };

  projected: {
    demandReduction: number; // [0, 1]
    infrastructureImprovement: number; // [0, 1]
    serviceReach: number; // [0, 1]
    developmentGapReduction: number; // Points reduction in gap score
    residualDevelopmentGap: number; // Projected gap score [0, 100]
    projectedGapScore: number; // Projected gap score [0, 100]
  };

  impact: {
    gapReductionPercent: number; // [0, 100]
    demandReductionPercent: number; // [0, 100]
    serviceReachPercent: number; // [0, 100]
    infrastructureImprovementPercent: number; // [0, 100]
  };

  explanation: string;

  dataQuality: 'Synthetic Demonstration Data';
}
