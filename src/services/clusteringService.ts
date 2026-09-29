/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory, CitizenSubmission, CitizenAIInterpretation } from '../types/citizen';
import {
  DemandCluster,
  DemandHotspot,
  ClusterLocation,
  SeverityDistribution,
  UrgencyDistribution,
} from '../types/demand';

export interface SubmissionWithInterpretation {
  submission: CitizenSubmission;
  interpretation: CitizenAIInterpretation;
}

/**
 * Civic Domain Theme Signatures
 * Deterministic keyword & semantic concept mapping to aggregate similar issues into clear demand statements.
 */
interface DomainThemeSignature {
  themeKey: string;
  title: string;
  normalizedDemand: string;
  keywords: string[];
}

const DOMAIN_THEME_SIGNATURES: Record<CivicCategory, DomainThemeSignature[]> = {
  'Roads & Mobility': [
    {
      themeKey: 'monsoon_connectivity',
      title: 'Monsoon Rural Road Inundation & Accessibility Disruption',
      normalizedDemand: 'Seasonal road waterlogging, mud degradation, and emergency connectivity severance during monsoons',
      keywords: ['monsoon', 'rain', 'waterlog', 'inundat', 'submerg', 'mud', 'unpaved', 'slippery', 'rainy', 'water accumulation', 'puddle', 'বর্ষা', 'বৃষ্টি', 'ডুবে', 'जलजमाव', 'बारिश', 'कीचड़'],
    },
    {
      themeKey: 'bridge_culvert',
      title: 'Damaged Canal Culverts & Narrow Bridge Reconstruction',
      normalizedDemand: 'Collapsed culverts, decaying wooden crossings, and bridge bottlenecks isolating rural habitations',
      keywords: ['bridge', 'culvert', 'canal', 'crossing', 'wooden bridge', 'collapsed', 'rotting', 'detour', 'কালভার্ট', 'ব্রিজ', 'খাল', 'पुलिया', 'पुल', 'नहर'],
    },
    {
      themeKey: 'pavement_potholes',
      title: 'Arterial Road Pavement Degradation & Severe Potholes',
      normalizedDemand: 'Broken asphalt surfaces, deep craters, and absent maintenance on key village-to-market corridors',
      keywords: ['pothole', 'broken road', 'tar', 'asphalt', 'crater', 'pavement', 'damaged road', 'রাস্তা খারাপ', 'খানাখন্দ', 'गड्ढे', 'सड़क खराब'],
    },
  ],
  'Water Access': [
    {
      themeKey: 'groundwater_depletion',
      title: 'Groundwater Depletion & Piped Drinking Water Supply Deficit',
      normalizedDemand: 'Declining aquifer tables, dried public tube-wells, low piped tap pressure, and short supply hours',
      keywords: ['groundwater', 'tube-well', 'tubewell', 'borewell', 'water table', 'dry tap', 'piped water', 'pressure', 'salin', 'fluoride', 'yellow water', 'পানের জল', 'নলকূপ', 'শুকিয়ে', 'नल', 'पानी', 'सूख', 'चापाकल', 'खारा'],
    },
    {
      themeKey: 'water_quality_contamination',
      title: 'Drinking Water Contamination & Filtration Deficit',
      normalizedDemand: 'Heavy mineral, iron, and microbial contamination in rural drinking sources requiring treatment filtration',
      keywords: ['iron', 'arsenic', 'contamination', 'dirty water', 'filter', 'unsafe water', 'stagnant', 'অপরিষ্কার জল', 'আয়রন', 'गंदा पानी', 'आर्सेनिक', 'प्रदूषित'],
    },
  ],
  'Healthcare Access': [
    {
      themeKey: 'phc_distance_ambulance',
      title: 'Rural Primary Healthcare Distance & Emergency Ambulance Deficit',
      normalizedDemand: 'High transit distance to Primary Health Centres combined with lack of emergency ambulance vehicles',
      keywords: ['ambulance', 'phc', 'health centre', 'sub-centre', 'distance', 'emergency', 'doctor', 'hospital', 'maternal', 'delivery', 'স্বাস্থ্যকেন্দ্র', 'ডাক্তার', 'অ্যাম্বুলেন্স', 'अस्पताल', 'डॉक्टर', 'एम्बुलेंस', 'प्रसव'],
    },
    {
      themeKey: 'medicine_staff_shortage',
      title: 'Sub-Centre Medical Staff Vacancies & Essential Drug Shortages',
      normalizedDemand: 'Unattended rural sub-centres, absent resident medical officers, and shortage of critical generic pharmaceuticals',
      keywords: ['staff vacancy', 'medicine shortage', 'pharmacy', 'night doctor', 'absenteeism', 'clinic closed', 'ওষুধ', 'दवा', 'स्टाफ'],
    },
  ],
  'Electricity & Power': [
    {
      themeKey: 'power_outages_transformers',
      title: 'Chronic Rural Power Outages & Transformer Replacement Delays',
      normalizedDemand: 'Unscheduled 8-12 hour blackouts, damaged distribution transformers, and prolonged restoration delays',
      keywords: ['power cut', 'outage', 'blackout', 'load shedding', 'transformer', 'burnt transformer', 'electricity', 'লোডশেডিং', 'ট্রান্সফরমার', 'बिजली', 'कटौती', 'ट्रांसफार्मर', 'अघोषित'],
    },
    {
      themeKey: 'low_voltage_irrigation',
      title: 'Low Voltage Instability & Agricultural Feeder Disruption',
      normalizedDemand: 'Severe line voltage drops below operating thresholds tripping irrigation pump sets and domestic equipment',
      keywords: ['low voltage', 'fluctuation', 'irrigation pump', 'feeder line', 'motor damage', 'ভোল্টেজ', 'কম ভোল্টেজ', 'वोल्टेज', 'मोटर'],
    },
  ],
  'School Facilities': [
    {
      themeKey: 'school_sanitation_water',
      title: 'Primary School Sanitation & Clean Drinking Water Infrastructure Deficit',
      normalizedDemand: 'Absence of separate functional toilets for girls and lacking safe drinking water in government schools',
      keywords: ['toilet', 'sanitation', 'drinking water filter', 'girls toilet', 'hygiene', 'টয়লেট', 'শৌচাগার', 'শৌচালয়', 'शौचालय', 'बालिका', 'पीने का पानी'],
    },
    {
      themeKey: 'classroom_infrastructure',
      title: 'Dilapidated School Buildings & Leaking Classroom Roofs',
      normalizedDemand: 'Damaged structural roofs, hazardous cracks, and severe classroom overcrowding during adverse weather',
      keywords: ['classroom', 'leaking roof', 'dilapidated', 'cracked wall', 'building damage', 'ক্লাসরুম', 'ছাদ', 'ভাঙ্গা', 'कक्षा', 'छत', 'जर्जर', 'भवन'],
    },
  ],
  'Other': [
    {
      themeKey: 'general_civic_amenity',
      title: 'General Community Infrastructure & Public Amenities Deficit',
      normalizedDemand: 'Uncategorized neighborhood civic amenity and public maintenance requirements',
      keywords: ['community', 'drain', 'waste', 'garbage', 'street light', 'পরিষ্কার', 'আবর্জনা', 'सफाई', 'कचरा'],
    },
  ],
};

/**
 * Tokenize and normalize text for explainable keyword similarity matching.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Match an individual report to a canonical semantic demand theme within its civic domain.
 */
export function identifyDemandTheme(
  domain: CivicCategory,
  issueText: string,
  primaryIssue: string,
  signals: string[] = []
): { themeKey: string; title: string; normalizedDemand: string } {
  const signatures = DOMAIN_THEME_SIGNATURES[domain] || DOMAIN_THEME_SIGNATURES['Other'];
  const fullCorpus = `${issueText} ${primaryIssue} ${signals.join(' ')}`.toLowerCase();

  let bestMatch = signatures[0];
  let highestScore = -1;

  for (const sig of signatures) {
    let score = 0;
    for (const kw of sig.keywords) {
      if (fullCorpus.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = sig;
    }
  }

  // If no specific signature keyword matched, generate a clean generalized summary from domain
  if (highestScore <= 0) {
    const cleanTitle = primaryIssue.length > 5 ? primaryIssue : `${domain} Localized Infrastructure Demand`;
    return {
      themeKey: `${domain.toLowerCase().replace(/[^a-z0-9]/g, '_')}_general`,
      title: cleanTitle,
      normalizedDemand: `Aggregated citizen requests regarding ${domain.toLowerCase()} access and localized infrastructure improvements.`,
    };
  }

  return bestMatch;
}

/**
 * Deterministic Semantic Demand Clustering Algorithm
 * Aggregates individual citizen reports + AI interpretations into explainable DemandClusters.
 */
export function clusterCitizenSubmissions(items: SubmissionWithInterpretation[]): DemandCluster[] {
  if (!items || items.length === 0) {
    return [];
  }

  // Bucket submissions by domain + themeKey
  const clustersMap = new Map<
    string,
    {
      civicDomain: CivicCategory;
      title: string;
      normalizedDemand: string;
      members: SubmissionWithInterpretation[];
    }
  >();

  for (const item of items) {
    const domain = (item.submission.category || 'Other') as CivicCategory;
    const theme = identifyDemandTheme(
      domain,
      item.submission.text,
      item.interpretation.primaryIssue || '',
      item.interpretation.entitiesOrSignals || []
    );

    const clusterKey = `${domain}:::${theme.themeKey}`;

    if (!clustersMap.has(clusterKey)) {
      clustersMap.set(clusterKey, {
        civicDomain: domain,
        title: theme.title,
        normalizedDemand: theme.normalizedDemand,
        members: [],
      });
    }

    clustersMap.get(clusterKey)!.members.push(item);
  }

  // Construct structured DemandCluster instances
  const result: DemandCluster[] = [];

  for (const [key, group] of clustersMap.entries()) {
    const reportCount = group.members.length;
    const memberIds = group.members.map((m) => m.submission.id);

    // 1. Location aggregation
    const locationMap = new Map<string, ClusterLocation>();
    for (const member of group.members) {
      const loc = member.submission.location;
      const locKey = `${loc.stateId}:::${loc.districtId}`;
      if (!locationMap.has(locKey)) {
        locationMap.set(locKey, {
          stateId: loc.stateId,
          stateName: loc.stateName,
          districtId: loc.districtId,
          districtName: loc.districtName,
          locality: loc.locality,
          reportCount: 0,
        });
      }
      locationMap.get(locKey)!.reportCount += 1;
    }
    const locations = Array.from(locationMap.values()).sort((a, b) => b.reportCount - a.reportCount);

    // 2. Severity distribution tally
    const severityDistribution: SeverityDistribution = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };
    for (const member of group.members) {
      const sev = member.interpretation.severity || 'Medium';
      if (severityDistribution[sev] !== undefined) {
        severityDistribution[sev] += 1;
      } else {
        severityDistribution.Medium += 1;
      }
    }

    // 3. Urgency distribution tally
    const urgencyDistribution: UrgencyDistribution = {
      Routine: 0,
      'Seasonal Risk': 0,
      Immediate: 0,
      'Long-term': 0,
    };
    for (const member of group.members) {
      const urg = member.interpretation.urgency || 'Routine';
      if (urgencyDistribution[urg] !== undefined) {
        urgencyDistribution[urg] += 1;
      } else {
        urgencyDistribution.Routine += 1;
      }
    }

    // 4. Extract distinct representative signals
    const signalsSet = new Set<string>();
    for (const member of group.members) {
      if (member.interpretation.entitiesOrSignals) {
        for (const sig of member.interpretation.entitiesOrSignals) {
          if (sig && sig.trim()) {
            signalsSet.add(sig.trim().toLowerCase());
          }
        }
      }
    }
    const representativeSignals = Array.from(signalsSet).slice(0, 8);

    // 5. Compute average confidence
    const totalConfidence = group.members.reduce((acc, m) => acc + (m.interpretation.confidence || 0.85), 0);
    const avgConfidence = Math.round((totalConfidence / reportCount) * 100) / 100;

    // Deterministic ID based on domain and theme
    const cleanId = `cluster-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    result.push({
      id: cleanId,
      civicDomain: group.civicDomain,
      title: group.title,
      normalizedDemand: group.normalizedDemand,
      reportCount,
      locations,
      severityDistribution,
      urgencyDistribution,
      representativeSignals,
      confidence: avgConfidence,
      memberReportIds: memberIds,
    });
  }

  // Sort clusters by highest report count first
  return result.sort((a, b) => b.reportCount - a.reportCount);
}

/**
 * Derive Demand Hotspots from aggregated Demand Clusters.
 * A Demand Hotspot exposes where a particular development demand is concentrated.
 */
export function deriveDemandHotspots(clusters: DemandCluster[]): DemandHotspot[] {
  if (!clusters || clusters.length === 0) {
    return [];
  }

  const hotspots: DemandHotspot[] = [];

  for (const cluster of clusters) {
    for (const loc of cluster.locations) {
      const hotspotId = `hotspot-${loc.stateId.toLowerCase()}-${loc.districtId.toLowerCase()}-${cluster.id}`;

      // Calculate proportionate severity and urgency distributions for this district
      // based on the proportion of reports in this location
      const ratio = loc.reportCount / cluster.reportCount;
      const districtSeverity: SeverityDistribution = {
        Low: Math.round(cluster.severityDistribution.Low * ratio),
        Medium: Math.round(cluster.severityDistribution.Medium * ratio),
        High: Math.round(cluster.severityDistribution.High * ratio),
        Critical: Math.round(cluster.severityDistribution.Critical * ratio),
      };
      // Ensure sum equals loc.reportCount
      const currentSum = districtSeverity.Low + districtSeverity.Medium + districtSeverity.High + districtSeverity.Critical;
      if (currentSum < loc.reportCount) {
        districtSeverity.High += loc.reportCount - currentSum;
      }

      const districtUrgency: UrgencyDistribution = {
        Routine: Math.round(cluster.urgencyDistribution.Routine * ratio),
        'Seasonal Risk': Math.round(cluster.urgencyDistribution['Seasonal Risk'] * ratio),
        Immediate: Math.round(cluster.urgencyDistribution.Immediate * ratio),
        'Long-term': Math.round(cluster.urgencyDistribution['Long-term'] * ratio),
      };

      const localities = loc.locality ? [loc.locality] : [];

      hotspots.push({
        id: hotspotId,
        clusterId: cluster.id,
        district: loc.districtName,
        districtId: loc.districtId,
        state: loc.stateName,
        stateId: loc.stateId,
        domain: cluster.civicDomain,
        demandTitle: cluster.title,
        normalizedDemand: cluster.normalizedDemand,
        reportCount: loc.reportCount,
        severityDistribution: districtSeverity,
        urgencyDistribution: districtUrgency,
        representativeSignals: cluster.representativeSignals,
        confidence: cluster.confidence,
        localities,
      });
    }
  }

  // Sort hotspots by report count descending
  return hotspots.sort((a, b) => b.reportCount - a.reportCount);
}
