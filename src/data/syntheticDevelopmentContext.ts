/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from '../types/citizen';
import {
  InfrastructureProfile,
  DemographicProfile,
  InvestmentProfile,
} from '../types/development';

/**
 * SYNTHETIC DEMONSTRATION CONTEXTUAL DATASETS
 *
 * NOTE: These datasets contain synthetic indicators designed to demonstrate
 * the multi-dimensional Development Gap calculation in the prototype.
 * They are NOT official government census, ministry, or fiscal statistics.
 */

// =========================================================================
// 1. INFRASTRUCTURE PROFILES (Synthetic baseline access scores: [0, 1])
// =========================================================================
export const SYNTHETIC_INFRASTRUCTURE_PROFILES: Record<string, InfrastructureProfile> = {
  nadia: {
    districtId: 'nadia',
    districtName: 'Nadia',
    stateId: 'WB',
    stateName: 'West Bengal',
    indicators: {
      roadAccessibility: 0.28, // Low all-weather connectivity in floodplains
      waterAccess: 0.52,
      healthcareAccess: 0.45,
      electricityReliability: 0.58,
      schoolFacilityAdequacy: 0.46,
    },
    coverageNotes: [
      'Seasonal inundation reduces effective all-weather road network in low-lying blocks.',
      'Primary school sanitation facilities require maintenance upgrades.',
    ],
  },
  murshidabad: {
    districtId: 'murshidabad',
    districtName: 'Murshidabad',
    stateId: 'WB',
    stateName: 'West Bengal',
    indicators: {
      roadAccessibility: 0.36,
      waterAccess: 0.44,
      healthcareAccess: 0.40,
      electricityReliability: 0.52,
      schoolFacilityAdequacy: 0.48,
    },
    coverageNotes: [
      'Canal network bridges and drainage culverts experience high structural wear.',
    ],
  },
  kalahandi: {
    districtId: 'kalahandi',
    districtName: 'Kalahandi',
    stateId: 'OD',
    stateName: 'Odisha',
    indicators: {
      roadAccessibility: 0.42,
      waterAccess: 0.22, // Severe potable groundwater depletion & pipeline deficits
      healthcareAccess: 0.35,
      electricityReliability: 0.48,
      schoolFacilityAdequacy: 0.38,
    },
    coverageNotes: [
      'Deep groundwater table decline limits summer handpump productivity.',
      'Piped water distribution networks suffer from low terminal pressure.',
    ],
  },
  gaya: {
    districtId: 'gaya',
    districtName: 'Gaya',
    stateId: 'BR',
    stateName: 'Bihar',
    indicators: {
      roadAccessibility: 0.44,
      waterAccess: 0.48,
      healthcareAccess: 0.25, // High PHC distance and sparse rural clinical coverage
      electricityReliability: 0.45,
      schoolFacilityAdequacy: 0.42,
    },
    coverageNotes: [
      'Average rural transit distance to functional Primary Health Centres exceeds 12 km.',
      'Emergency ambulance response times constrained in peripheral forest blocks.',
    ],
  },
  muzaffarpur: {
    districtId: 'muzaffarpur',
    districtName: 'Muzaffarpur',
    stateId: 'BR',
    stateName: 'Bihar',
    indicators: {
      roadAccessibility: 0.50,
      waterAccess: 0.54,
      healthcareAccess: 0.48,
      electricityReliability: 0.32, // Chronic rural load-shedding & transformer replacement backlogs
      schoolFacilityAdequacy: 0.44,
    },
    coverageNotes: [
      'Rural feeder lines experience high peak-season load strain and transformer outages.',
      'Agricultural irrigation feeder lines suffer from prolonged low-voltage drops.',
    ],
  },
  patna: {
    districtId: 'patna',
    districtName: 'Patna',
    stateId: 'BR',
    stateName: 'Bihar',
    indicators: {
      roadAccessibility: 0.72, // Better urban/peri-urban baseline
      waterAccess: 0.68,
      healthcareAccess: 0.70,
      electricityReliability: 0.74,
      schoolFacilityAdequacy: 0.65,
    },
    coverageNotes: [
      'Peri-urban connectivity is relatively developed compared to interior rural belts.',
    ],
  },
};

// =========================================================================
// 2. DEMOGRAPHIC PROFILES (Synthetic population exposure & pressure metrics)
// =========================================================================
export const SYNTHETIC_DEMOGRAPHIC_PROFILES: Record<string, DemographicProfile> = {
  nadia: {
    districtId: 'nadia',
    population: 5168000,
    populationDensity: 1316,
    ruralPopulationShare: 0.72,
    vulnerablePopulationShare: 0.34,
    pressureIndicators: {
      seasonalPressure: 0.85, // High monsoon vulnerability
      serviceDemandPressure: 0.76,
    },
  },
  murshidabad: {
    districtId: 'murshidabad',
    population: 7104000,
    populationDensity: 1334,
    ruralPopulationShare: 0.81,
    vulnerablePopulationShare: 0.38,
    pressureIndicators: {
      seasonalPressure: 0.78,
      serviceDemandPressure: 0.82,
    },
  },
  kalahandi: {
    districtId: 'kalahandi',
    population: 1577000,
    populationDensity: 199,
    ruralPopulationShare: 0.92,
    vulnerablePopulationShare: 0.46,
    pressureIndicators: {
      seasonalPressure: 0.88, // High summer drought vulnerability
      serviceDemandPressure: 0.70,
    },
  },
  gaya: {
    districtId: 'gaya',
    population: 4391000,
    populationDensity: 884,
    ruralPopulationShare: 0.87,
    vulnerablePopulationShare: 0.42,
    pressureIndicators: {
      seasonalPressure: 0.65,
      serviceDemandPressure: 0.78,
    },
  },
  muzaffarpur: {
    districtId: 'muzaffarpur',
    population: 4801000,
    populationDensity: 1512,
    ruralPopulationShare: 0.90,
    vulnerablePopulationShare: 0.36,
    pressureIndicators: {
      seasonalPressure: 0.72,
      serviceDemandPressure: 0.84, // High population density demand strain
    },
  },
  patna: {
    districtId: 'patna',
    population: 5838000,
    populationDensity: 1823,
    ruralPopulationShare: 0.57,
    vulnerablePopulationShare: 0.22,
    pressureIndicators: {
      seasonalPressure: 0.40,
      serviceDemandPressure: 0.60,
    },
  },
};

// =========================================================================
// 3. INVESTMENT PROFILES (Synthetic recent capital allocation indices: [0, 1])
// =========================================================================
export const SYNTHETIC_INVESTMENT_PROFILES: Record<string, InvestmentProfile> = {
  nadia: {
    districtId: 'nadia',
    recentInvestmentIndex: 0.38,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.31 },
      { domain: 'Water Access', investmentIndex: 0.48 },
      { domain: 'Healthcare Access', investmentIndex: 0.42 },
      { domain: 'Electricity & Power', investmentIndex: 0.50 },
      { domain: 'School Facilities', investmentIndex: 0.44 },
    ],
    coverageNotes: ['Recent road maintenance works focused on national corridors rather than rural connectors.'],
  },
  murshidabad: {
    districtId: 'murshidabad',
    recentInvestmentIndex: 0.41,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.35 },
      { domain: 'Water Access', investmentIndex: 0.42 },
      { domain: 'Healthcare Access', investmentIndex: 0.39 },
      { domain: 'Electricity & Power', investmentIndex: 0.46 },
      { domain: 'School Facilities', investmentIndex: 0.45 },
    ],
    coverageNotes: ['Minor canal culverts have not received capital reconstruction tenders recently.'],
  },
  kalahandi: {
    districtId: 'kalahandi',
    recentInvestmentIndex: 0.32,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.45 },
      { domain: 'Water Access', investmentIndex: 0.25 }, // Low recent piped water capital outlays
      { domain: 'Healthcare Access', investmentIndex: 0.34 },
      { domain: 'Electricity & Power', investmentIndex: 0.40 },
      { domain: 'School Facilities', investmentIndex: 0.36 },
    ],
    coverageNotes: ['Piped drinking water schemes under active rollout but terminal coverage remains limited.'],
  },
  gaya: {
    districtId: 'gaya',
    recentInvestmentIndex: 0.35,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.46 },
      { domain: 'Water Access', investmentIndex: 0.44 },
      { domain: 'Healthcare Access', investmentIndex: 0.28 }, // Low rural clinical capital allocation
      { domain: 'Electricity & Power', investmentIndex: 0.42 },
      { domain: 'School Facilities', investmentIndex: 0.38 },
    ],
    coverageNotes: ['Capital funding concentrated at district hospital rather than peripheral sub-centres.'],
  },
  muzaffarpur: {
    districtId: 'muzaffarpur',
    recentInvestmentIndex: 0.42,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.52 },
      { domain: 'Water Access', investmentIndex: 0.48 },
      { domain: 'Healthcare Access', investmentIndex: 0.44 },
      { domain: 'Electricity & Power', investmentIndex: 0.34 }, // Low rural transformer capacity additions
      { domain: 'School Facilities', investmentIndex: 0.40 },
    ],
    coverageNotes: ['Grid augmentation tenders pending for rural feeder line upgrades.'],
  },
  patna: {
    districtId: 'patna',
    recentInvestmentIndex: 0.72,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.78 },
      { domain: 'Water Access', investmentIndex: 0.70 },
      { domain: 'Healthcare Access', investmentIndex: 0.75 },
      { domain: 'Electricity & Power', investmentIndex: 0.76 },
      { domain: 'School Facilities', investmentIndex: 0.68 },
    ],
    coverageNotes: ['High municipal and suburban infrastructure investment outlays.'],
  },
};

/**
 * Checks if explicit synthetic contextual datasets exist for a given district.
 */
export function hasContextProfile(districtId: string): boolean {
  const key = districtId.toLowerCase();
  return (
    key in SYNTHETIC_INFRASTRUCTURE_PROFILES ||
    key in SYNTHETIC_DEMOGRAPHIC_PROFILES ||
    key in SYNTHETIC_INVESTMENT_PROFILES
  );
}

/**
 * Fallback helpers for districts without an explicit handcrafted profile
 */
export function getInfrastructureProfile(districtId: string, stateId: string = 'WB', districtName: string = 'District'): InfrastructureProfile {
  const key = districtId.toLowerCase();
  if (SYNTHETIC_INFRASTRUCTURE_PROFILES[key]) {
    return SYNTHETIC_INFRASTRUCTURE_PROFILES[key];
  }
  return {
    districtId,
    districtName,
    stateId,
    stateName: stateId,
    indicators: {
      roadAccessibility: 0.50,
      waterAccess: 0.50,
      healthcareAccess: 0.50,
      electricityReliability: 0.50,
      schoolFacilityAdequacy: 0.50,
    },
    coverageNotes: ['Standard synthetic baseline indicators applied.'],
  };
}

export function getDemographicProfile(districtId: string): DemographicProfile {
  const key = districtId.toLowerCase();
  if (SYNTHETIC_DEMOGRAPHIC_PROFILES[key]) {
    return SYNTHETIC_DEMOGRAPHIC_PROFILES[key];
  }
  return {
    districtId,
    population: 2500000,
    populationDensity: 600,
    ruralPopulationShare: 0.75,
    vulnerablePopulationShare: 0.30,
    pressureIndicators: {
      seasonalPressure: 0.50,
      serviceDemandPressure: 0.50,
    },
  };
}

export function getInvestmentProfile(districtId: string): InvestmentProfile {
  const key = districtId.toLowerCase();
  if (SYNTHETIC_INVESTMENT_PROFILES[key]) {
    return SYNTHETIC_INVESTMENT_PROFILES[key];
  }
  return {
    districtId,
    recentInvestmentIndex: 0.50,
    investmentByDomain: [
      { domain: 'Roads & Mobility', investmentIndex: 0.50 },
      { domain: 'Water Access', investmentIndex: 0.50 },
      { domain: 'Healthcare Access', investmentIndex: 0.50 },
      { domain: 'Electricity & Power', investmentIndex: 0.50 },
      { domain: 'School Facilities', investmentIndex: 0.50 },
    ],
    coverageNotes: ['Standard synthetic investment indicators applied.'],
  };
}
