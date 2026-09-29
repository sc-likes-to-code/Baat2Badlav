/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from './citizen';

export type GapLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface InfrastructureIndicators {
  roadAccessibility?: number; // [0, 1] — higher means better baseline access
  waterAccess?: number; // [0, 1] — higher means better baseline piped/potable supply
  healthcareAccess?: number; // [0, 1] — higher means lower facility distance & better clinic coverage
  electricityReliability?: number; // [0, 1] — higher means fewer outage hours & stable grid
  schoolFacilityAdequacy?: number; // [0, 1] — higher means better pupil-classroom ratios & sanitation
}

export interface InfrastructureProfile {
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  indicators: InfrastructureIndicators;
  coverageNotes: string[];
}

export interface DemographicPressureIndicators {
  seasonalPressure?: number; // [0, 1] — vulnerability to monsoons/summer dry cycles
  serviceDemandPressure?: number; // [0, 1] — aggregate baseline population density strain
}

export interface DemographicProfile {
  districtId: string;
  population: number;
  populationDensity?: number; // people per sq km
  ruralPopulationShare?: number; // [0, 1]
  vulnerablePopulationShare?: number; // [0, 1]
  pressureIndicators: DemographicPressureIndicators;
}

export interface DomainInvestmentEntry {
  domain: CivicCategory;
  investmentIndex: number; // [0, 1] — synthetic level of recent capital allocations
}

export interface InvestmentProfile {
  districtId: string;
  recentInvestmentIndex?: number; // [0, 1]
  investmentByDomain: DomainInvestmentEntry[];
  coverageNotes: string[];
}

export interface DevelopmentGapFormulaBreakdown {
  demandWeighted: number; // 0.40 * demandSignal
  infraWeighted: number; // 0.30 * infrastructureNeed
  demoWeighted: number; // 0.20 * demographicPressure
  investWeighted: number; // 0.10 * investmentGap
}

export interface DevelopmentGap {
  id: string;
  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;
  civicDomain: CivicCategory;

  demandClusterId: string;
  demandTitle: string;
  reportCount: number;
  localities: string[];
  representativeSignals: string[];

  // Normalized component scores [0, 1]
  demandSignal: number;
  infrastructureNeed: number;
  demographicPressure: number;
  investmentCoverage: number;
  investmentGap: number;

  // Composite score [0, 100] and qualitative level
  developmentGapScore: number;
  gapLevel: GapLevel;

  formulaBreakdown: DevelopmentGapFormulaBreakdown;
  explanation: string;
  dataQuality: 'Synthetic Demonstration Data';
}
