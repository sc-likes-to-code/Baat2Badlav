/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from '../types/citizen';
import { DemandHotspot } from '../types/demand';
import {
  DevelopmentGap,
  GapLevel,
  InfrastructureProfile,
  DemographicProfile,
  InvestmentProfile,
} from '../types/development';
import {
  getInfrastructureProfile,
  getDemographicProfile,
  getInvestmentProfile,
  hasContextProfile,
} from '../data/syntheticDevelopmentContext';

/**
 * Normalizes citizen demand volume, severity, and urgency distributions into a [0, 1] demand signal.
 */
function calculateDemandSignal(hotspot: DemandHotspot): number {
  const total = hotspot.reportCount || 1;

  // 1. Volume factor: scaled logarithmically/linearly up to 5 reports
  const volumeFactor = Math.min(1.0, 0.35 + (hotspot.reportCount * 0.15));

  // 2. Severity factor: weighted severity proportion
  const sev = hotspot.severityDistribution;
  const severityWeighted =
    (sev.Critical * 1.0 + sev.High * 0.8 + sev.Medium * 0.5 + sev.Low * 0.2) / total;

  // 3. Urgency factor: weighted urgency proportion
  const urg = hotspot.urgencyDistribution;
  const urgencyWeighted =
    (urg.Immediate * 1.0 + urg['Seasonal Risk'] * 0.85 + urg.Routine * 0.45 + urg['Long-term'] * 0.35) / total;

  // Combined demand signal in [0, 1]
  const demandSignal = volumeFactor * 0.40 + severityWeighted * 0.35 + urgencyWeighted * 0.25;
  return Math.round(Math.min(1.0, Math.max(0.0, demandSignal)) * 100) / 100;
}

/**
 * Extracts domain-specific infrastructure coverage and returns normalized Infrastructure Need (1 - Coverage).
 */
function calculateInfrastructureNeed(domain: CivicCategory, infra: InfrastructureProfile): { infrastructureNeed: number; baselineCoverage: number } {
  let coverage = 0.50;

  switch (domain) {
    case 'Roads & Mobility':
      coverage = infra.indicators.roadAccessibility ?? 0.50;
      break;
    case 'Water Access':
      coverage = infra.indicators.waterAccess ?? 0.50;
      break;
    case 'Healthcare Access':
      coverage = infra.indicators.healthcareAccess ?? 0.50;
      break;
    case 'Electricity & Power':
      coverage = infra.indicators.electricityReliability ?? 0.50;
      break;
    case 'School Facilities':
      coverage = infra.indicators.schoolFacilityAdequacy ?? 0.50;
      break;
    default:
      coverage = 0.50;
  }

  const need = Math.max(0.0, Math.min(1.0, 1.0 - coverage));
  return {
    infrastructureNeed: Math.round(need * 100) / 100,
    baselineCoverage: Math.round(coverage * 100) / 100,
  };
}

/**
 * Computes demographic/service pressure in [0, 1] from synthetic demographic indicators.
 */
function calculateDemographicPressure(demo: DemographicProfile): number {
  const ruralShare = demo.ruralPopulationShare ?? 0.70;
  const seasonal = demo.pressureIndicators.seasonalPressure ?? 0.50;
  const serviceDemand = demo.pressureIndicators.serviceDemandPressure ?? 0.50;
  const densityFactor = Math.min(1.0, (demo.populationDensity ?? 600) / 1500);

  const pressure = ruralShare * 0.35 + seasonal * 0.35 + serviceDemand * 0.20 + densityFactor * 0.10;
  return Math.round(Math.min(1.0, Math.max(0.0, pressure)) * 100) / 100;
}

/**
 * Extracts domain-specific investment coverage and returns normalized Investment Gap (1 - Coverage).
 */
function calculateInvestmentGap(domain: CivicCategory, invest: InvestmentProfile): { investmentCoverage: number; investmentGap: number } {
  const entry = invest.investmentByDomain.find((item) => item.domain === domain);
  const coverage = entry ? entry.investmentIndex : (invest.recentInvestmentIndex ?? 0.50);
  const gap = Math.max(0.0, Math.min(1.0, 1.0 - coverage));

  return {
    investmentCoverage: Math.round(coverage * 100) / 100,
    investmentGap: Math.round(gap * 100) / 100,
  };
}

/**
 * Maps composite numeric score to qualitative GapLevel.
 */
export function getGapLevel(score: number): GapLevel {
  if (score >= 75) return 'Very High';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
}

/**
 * Generates an analytical, non-prescriptive explanation of the score drivers.
 */
function generateGapExplanation(
  districtName: string,
  domain: CivicCategory,
  demandSignal: number,
  baselineCoverage: number,
  demographicPressure: number,
  investmentCoverage: number,
  gapScore: number,
  gapLevel: GapLevel
): string {
  const demandText = demandSignal >= 0.7 ? 'elevated citizen demand' : demandSignal >= 0.4 ? 'moderate citizen demand' : 'localized citizen signals';
  const infraText = baselineCoverage <= 0.35 ? 'low baseline service access' : baselineCoverage <= 0.6 ? 'moderate infrastructure coverage' : 'established baseline coverage';
  const pressureText = demographicPressure >= 0.7 ? 'high seasonal and demographic vulnerability' : 'standard demographic strain';
  const investText = investmentCoverage <= 0.35 ? 'limited recent public investment' : 'active capital allocation';

  return `${districtName} reflects ${demandText} in ${domain} intersecting with ${infraText} (${Math.round(baselineCoverage * 100)}%) and ${pressureText}, while synthetic investment coverage stands at ${Math.round(investmentCoverage * 100)}%. This produces an aggregated ${gapLevel} Development Gap index of ${gapScore}/100.`;
}

/**
 * Calculates deterministic Development Gaps for all active demand hotspots
 * using synthetic infrastructure, demographic, and investment profiles.
 */
export function calculateDevelopmentGaps(hotspots: DemandHotspot[]): DevelopmentGap[] {
  if (!hotspots || hotspots.length === 0) {
    return [];
  }

  const results: DevelopmentGap[] = [];

  for (const hotspot of hotspots) {
    const districtId = hotspot.districtId.toLowerCase();
    if (!hasContextProfile(districtId)) {
      // Gracefully exclude from context-dependent gap calculations when baseline contextual dataset is absent
      continue;
    }
    const infraProfile = getInfrastructureProfile(districtId, hotspot.stateId, hotspot.district);
    const demoProfile = getDemographicProfile(districtId);
    const investProfile = getInvestmentProfile(districtId);

    // 1. Calculate the 4 normalized components [0, 1]
    const demandSignal = calculateDemandSignal(hotspot);
    const { infrastructureNeed, baselineCoverage } = calculateInfrastructureNeed(hotspot.domain, infraProfile);
    const demographicPressure = calculateDemographicPressure(demoProfile);
    const { investmentCoverage, investmentGap } = calculateInvestmentGap(hotspot.domain, investProfile);

    // 2. Apply deterministic demonstration weights:
    // Development Gap = 0.40 × Demand + 0.30 × Infra Need + 0.20 × Demo Pressure + 0.10 × Investment Gap
    const demandWeighted = Math.round(0.40 * demandSignal * 100) / 100;
    const infraWeighted = Math.round(0.30 * infrastructureNeed * 100) / 100;
    const demoWeighted = Math.round(0.20 * demographicPressure * 100) / 100;
    const investWeighted = Math.round(0.10 * investmentGap * 100) / 100;

    const compositeScore = Math.round((demandWeighted + infraWeighted + demoWeighted + investWeighted) * 100);
    const clampedScore = Math.min(100, Math.max(0, compositeScore));
    const gapLevel = getGapLevel(clampedScore);

    const explanation = generateGapExplanation(
      hotspot.district,
      hotspot.domain,
      demandSignal,
      baselineCoverage,
      demographicPressure,
      investmentCoverage,
      clampedScore,
      gapLevel
    );

    const gapId = `gap-${hotspot.id}`;

    results.push({
      id: gapId,
      districtId: hotspot.districtId,
      districtName: hotspot.district,
      stateId: hotspot.stateId,
      stateName: hotspot.state,
      civicDomain: hotspot.domain,
      demandClusterId: hotspot.clusterId,
      demandTitle: hotspot.demandTitle,
      reportCount: hotspot.reportCount,
      localities: hotspot.localities,
      representativeSignals: hotspot.representativeSignals,
      demandSignal,
      infrastructureNeed,
      demographicPressure,
      investmentCoverage,
      investmentGap,
      developmentGapScore: clampedScore,
      gapLevel,
      formulaBreakdown: {
        demandWeighted,
        infraWeighted,
        demoWeighted,
        investWeighted,
      },
      explanation,
      dataQuality: 'Synthetic Demonstration Data',
    });
  }

  // Sort descending by highest development gap score
  return results.sort((a, b) => b.developmentGapScore - a.developmentGapScore);
}
