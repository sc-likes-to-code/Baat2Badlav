/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from '../types/citizen';
import { DemandHotspot } from '../types/demand';
import { DevelopmentGap } from '../types/development';
import { PriorityAssessment, PriorityBand } from '../types/priority';

/**
 * Maps composite numeric priority score to qualitative PriorityBand.
 * Exact thresholds:
 * - Critical Signal: >= 75
 * - High Signal: 55 - 74
 * - Moderate Signal: 35 - 54
 * - Emerging Signal: < 35
 */
export function getPriorityBand(score: number): PriorityBand {
  if (score >= 75) return 'Critical Signal';
  if (score >= 55) return 'High Signal';
  if (score >= 35) return 'Moderate Signal';
  return 'Emerging Signal';
}

/**
 * Calculates deterministic urgency signal [0, 1] using fixed weights:
 * Immediate = 1.00, Seasonal Risk = 0.85, Routine = 0.45, Long-term = 0.35.
 */
function calculateUrgencySignal(hotspot?: DemandHotspot): number {
  if (!hotspot || !hotspot.urgencyDistribution) return 0.50;
  const total = hotspot.reportCount || 1;
  const urg = hotspot.urgencyDistribution;
  const weighted =
    (urg.Immediate * 1.00 +
      urg['Seasonal Risk'] * 0.85 +
      urg.Routine * 0.45 +
      urg['Long-term'] * 0.35) /
    total;
  return Math.round(Math.min(1.0, Math.max(0.0, weighted)) * 100) / 100;
}

/**
 * Calculates deterministic severity signal [0, 1].
 */
function calculateSeveritySignal(hotspot?: DemandHotspot): number {
  if (!hotspot || !hotspot.severityDistribution) return 0.50;
  const total = hotspot.reportCount || 1;
  const sev = hotspot.severityDistribution;
  const weighted =
    (sev.Critical * 1.00 +
      sev.High * 0.80 +
      sev.Medium * 0.50 +
      sev.Low * 0.20) /
    total;
  return Math.round(Math.min(1.0, Math.max(0.0, weighted)) * 100) / 100;
}

/**
 * Calculates geographic concentration [0, 1] based on local demand aggregation evidence.
 */
function calculateGeographicConcentration(gap: DevelopmentGap): number {
  const hasLocalities = gap.localities && gap.localities.length > 0;
  const localityBase = hasLocalities ? 0.30 : 0.15;
  const volumeComponent = Math.min(0.30, gap.reportCount * 0.10);
  const concentration = 0.40 + localityBase + volumeComponent;
  return Math.round(Math.min(1.0, Math.max(0.0, concentration)) * 100) / 100;
}

/**
 * Generates neutral, explainable narrative explaining the score drivers.
 */
function generatePriorityExplanation(
  districtName: string,
  domain: CivicCategory,
  demandIntensity: number,
  gapScore: number,
  urgency: number,
  geoConcentration: number,
  servicePressure: number,
  priorityScore: number,
  priorityBand: PriorityBand
): string {
  const demandDesc = demandIntensity >= 0.8 ? 'elevated demand intensity' : demandIntensity >= 0.6 ? 'moderate demand signals' : 'localized citizen signals';
  const urgencyDesc = urgency >= 0.85 ? 'acute time-sensitive urgency' : urgency >= 0.6 ? 'seasonal risk factors' : 'standard routine maintenance timeline';
  const geoDesc = geoConcentration >= 0.85 ? 'highly localized geographic concentration' : 'dispersed geographic footprint';
  const pressureDesc = servicePressure >= 0.75 ? 'significant demographic service strain' : 'moderate service pressure';

  return `${districtName} exhibits ${demandDesc} in ${domain} combined with a substantial development gap (${gapScore}/100) and ${urgencyDesc}. Evidence reflects ${geoDesc} and ${pressureDesc}, yielding a ${priorityBand} index of ${priorityScore}/100.`;
}

/**
 * Calculates deterministic PriorityAssessments by combining Development Gaps with Demand Hotspots.
 *
 * Formula:
 * Priority Score = (
 *   0.30 × Demand Intensity +
 *   0.30 × Development Gap +
 *   0.15 × Urgency +
 *   0.15 × Geographic Concentration +
 *   0.10 × Service Pressure
 * ) × 100
 */
export function calculatePriorityAssessments(
  gaps: DevelopmentGap[],
  hotspots: DemandHotspot[]
): PriorityAssessment[] {
  if (!gaps || gaps.length === 0) {
    return [];
  }

  // Index hotspots for direct lookup
  const hotspotMap = new Map<string, DemandHotspot>();
  for (const h of hotspots) {
    hotspotMap.set(h.id, h);
    // Also map by clusterId + districtId for flexible lookup
    hotspotMap.set(`${h.districtId.toLowerCase()}:::${h.clusterId}`, h);
  }

  const assessments: PriorityAssessment[] = [];

  for (const gap of gaps) {
    const rawHotspotId = gap.id.replace('gap-', '');
    const matchedHotspot =
      hotspotMap.get(rawHotspotId) ||
      hotspotMap.get(`${gap.districtId.toLowerCase()}:::${gap.demandClusterId}`);

    // 1. Five Normalized Factors [0, 1]
    const demandIntensity = gap.demandSignal; // [0, 1] from Update 04/05
    const developmentGapFactor = Math.round((gap.developmentGapScore / 100) * 100) / 100; // [0, 1]
    const urgency = calculateUrgencySignal(matchedHotspot); // [0, 1]
    const geographicConcentration = calculateGeographicConcentration(gap); // [0, 1]
    const servicePressure = gap.demographicPressure; // [0, 1] from Update 05

    // 2. Evidence Metrics
    const severitySignal = calculateSeveritySignal(matchedHotspot);
    const urgencySignal = urgency;

    // 3. Weighted Components (0.30 + 0.30 + 0.15 + 0.15 + 0.10 = 1.00)
    const demandIntensityWeighted = Math.round(0.30 * demandIntensity * 100) / 100;
    const developmentGapWeighted = Math.round(0.30 * developmentGapFactor * 100) / 100;
    const urgencyWeighted = Math.round(0.15 * urgency * 100) / 100;
    const geographicConcentrationWeighted = Math.round(0.15 * geographicConcentration * 100) / 100;
    const servicePressureWeighted = Math.round(0.10 * servicePressure * 100) / 100;

    // 4. Raw floating-point composite sum scaled to [0, 100]
    const rawComposite =
      (0.30 * demandIntensity +
        0.30 * developmentGapFactor +
        0.15 * urgency +
        0.15 * geographicConcentration +
        0.10 * servicePressure) *
      100;

    const priorityScore = Math.min(100, Math.max(0, Math.round(rawComposite)));
    const priorityBand = getPriorityBand(priorityScore);

    const explanation = generatePriorityExplanation(
      gap.districtName,
      gap.civicDomain,
      demandIntensity,
      gap.developmentGapScore,
      urgency,
      geographicConcentration,
      servicePressure,
      priorityScore,
      priorityBand
    );

    const priorityId = `priority-${gap.id}`;

    assessments.push({
      id: priorityId,
      developmentGapId: gap.id,
      districtId: gap.districtId,
      districtName: gap.districtName,
      stateId: gap.stateId,
      stateName: gap.stateName,
      civicDomain: gap.civicDomain,
      demandTitle: gap.demandTitle,
      priorityScore,
      priorityBand,
      factors: {
        demandIntensity,
        developmentGap: developmentGapFactor,
        urgency,
        geographicConcentration,
        servicePressure,
      },
      evidence: {
        reportCount: gap.reportCount,
        severitySignal,
        urgencySignal,
        infrastructureNeed: gap.infrastructureNeed,
        demographicPressure: gap.demographicPressure,
        investmentGap: gap.investmentGap,
      },
      formulaBreakdown: {
        demandIntensityWeighted,
        developmentGapWeighted,
        urgencyWeighted,
        geographicConcentrationWeighted,
        servicePressureWeighted,
      },
      explanation,
      dataQuality: 'Synthetic Demonstration Data',
    });
  }

  // Sort descending with deterministic tie-breakers:
  // 1. priorityScore (desc)
  // 2. developmentGapScore (desc)
  // 3. reportCount (desc)
  // 4. districtName (asc alphabetical)
  return assessments.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    const gapA = gaps.find((g) => g.id === a.developmentGapId);
    const gapB = gaps.find((g) => g.id === b.developmentGapId);
    const scoreA = gapA ? gapA.developmentGapScore : 0;
    const scoreB = gapB ? gapB.developmentGapScore : 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    if (b.evidence.reportCount !== a.evidence.reportCount) {
      return b.evidence.reportCount - a.evidence.reportCount;
    }
    return a.districtName.localeCompare(b.districtName);
  });
}
