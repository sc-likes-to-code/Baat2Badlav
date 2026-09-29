/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from './citizen';

export type PriorityBand =
  | 'Critical Signal'
  | 'High Signal'
  | 'Moderate Signal'
  | 'Emerging Signal';

export interface PriorityFactors {
  demandIntensity: number; // [0, 1]
  developmentGap: number; // [0, 1] (developmentGapScore / 100)
  urgency: number; // [0, 1]
  geographicConcentration: number; // [0, 1]
  servicePressure: number; // [0, 1]
}

export interface PriorityEvidence {
  reportCount: number;
  severitySignal: number;
  urgencySignal: number;
  infrastructureNeed: number;
  demographicPressure: number;
  investmentGap: number;
}

export interface PriorityFormulaBreakdown {
  demandIntensityWeighted: number; // 0.30 * demandIntensity
  developmentGapWeighted: number; // 0.30 * developmentGap
  urgencyWeighted: number; // 0.15 * urgency
  geographicConcentrationWeighted: number; // 0.15 * geographicConcentration
  servicePressureWeighted: number; // 0.10 * servicePressure
}

export interface PriorityAssessment {
  id: string;
  developmentGapId: string;

  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;

  civicDomain: CivicCategory;
  demandTitle: string;

  priorityScore: number; // [0, 100]
  priorityBand: PriorityBand;

  factors: PriorityFactors;
  evidence: PriorityEvidence;
  formulaBreakdown: PriorityFormulaBreakdown;

  explanation: string;
  dataQuality: 'Synthetic Demonstration Data';
}
