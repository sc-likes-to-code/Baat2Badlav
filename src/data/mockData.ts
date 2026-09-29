export interface Hotspot {
  id: string;
  name: string;
  state: string;
  district: string;
  cluster: string;
  sector: 'Roads & Mobility' | 'Water Access' | 'Healthcare Access' | 'Electricity & Power' | 'School Facilities';
  gapScore: number;
  gapStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  citizenRequests: number;
  exposedPopulation: number;
  villagesCount: number;
  demandIndex: number;
  infraBaseline: number;
  investmentCoverage: number;
  urgencyScore: number;
  vulnerabilityScore?: number;
  coordinates: { x: number; y: number }; // SVG map coordinates
  primaryIssue: string;
  trendVelocity: string;
  whyItMatters: string;
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'nadia',
    name: 'Nadia Basin',
    state: 'West Bengal',
    district: 'Nadia',
    cluster: '17 GPs Contiguous Cluster',
    sector: 'Roads & Mobility',
    gapScore: 91,
    gapStatus: 'HIGH',
    citizenRequests: 1284,
    exposedPopulation: 72400,
    villagesCount: 17,
    demandIndex: 91,
    infraBaseline: 28,
    investmentCoverage: 31,
    urgencyScore: 82,
    vulnerabilityScore: 64,
    coordinates: { x: 504, y: 285 },
    primaryIssue: 'Monsoon road inundation and physical access severance',
    trendVelocity: '↑ Emerging (+18% MoM)',
    whyItMatters: 'High citizen demand is concentrated across multiple contiguous gram panchayats while PMGSY all-weather road coverage remains 42% below district baseline. Existing public works tenders do not correspond with current seasonal disruption testimony.'
  },
  {
    id: 'kalahandi',
    name: 'Kalahandi Basin',
    state: 'Odisha',
    district: 'Kalahandi',
    cluster: 'Junagarh Block',
    sector: 'Water Access',
    gapScore: 87,
    gapStatus: 'HIGH',
    citizenRequests: 936,
    exposedPopulation: 48200,
    villagesCount: 14,
    demandIndex: 87,
    infraBaseline: 34,
    investmentCoverage: 33,
    urgencyScore: 85,
    vulnerabilityScore: 72,
    coordinates: { x: 455, y: 340 },
    primaryIssue: 'Salinity intrusion, fluoride contamination & acute pipe pressure drop',
    trendVelocity: '↑ Emerging (+11% MoM)',
    whyItMatters: 'Deep groundwater extraction points have dropped below seasonal recharge thresholds, leading to recurring dry taps across 14 panchayats during summer months.'
  },
  {
    id: 'gaya',
    name: 'Gaya Rural Belt',
    state: 'Bihar',
    district: 'Gaya',
    cluster: 'Sherghati Tract',
    sector: 'Healthcare Access',
    gapScore: 69,
    gapStatus: 'MEDIUM',
    citizenRequests: 714,
    exposedPopulation: 61000,
    villagesCount: 19,
    demandIndex: 69,
    infraBaseline: 41,
    investmentCoverage: 46,
    urgencyScore: 71,
    vulnerabilityScore: 60,
    coordinates: { x: 435, y: 235 },
    primaryIssue: 'Sub-centre distance >12km in rural tracts with zero emergency ambulance transit',
    trendVelocity: '→ Steady (±2% MoM)',
    whyItMatters: 'Primary healthcare centers report severe medical staff vacancies combined with broken feeder corridors, tripling maternal delivery transit times.'
  },
  {
    id: 'murshidabad',
    name: 'Murshidabad Central',
    state: 'West Bengal',
    district: 'Murshidabad',
    cluster: 'Lalgola GP',
    sector: 'Roads & Mobility',
    gapScore: 64,
    gapStatus: 'MEDIUM',
    citizenRequests: 628,
    exposedPopulation: 39500,
    villagesCount: 11,
    demandIndex: 78,
    infraBaseline: 46,
    investmentCoverage: 49,
    urgencyScore: 74,
    vulnerabilityScore: 58,
    coordinates: { x: 498, y: 265 },
    primaryIssue: 'Embankment soil degradation & damaged river-crossing bridges',
    trendVelocity: '↑ Emerging (+9% MoM)',
    whyItMatters: 'Riverbank erosion regularly compromises regional culverts connecting agricultural mandis with highway NH-12.'
  },
  {
    id: 'barmer',
    name: 'Barmer Desert Tract',
    state: 'Rajasthan',
    district: 'Barmer',
    cluster: 'Sedwa & Chohtan Blocks',
    sector: 'Water Access',
    gapScore: 76,
    gapStatus: 'HIGH',
    citizenRequests: 812,
    exposedPopulation: 54000,
    villagesCount: 22,
    demandIndex: 82,
    infraBaseline: 29,
    investmentCoverage: 36,
    urgencyScore: 89,
    vulnerabilityScore: 75,
    coordinates: { x: 265, y: 275 },
    primaryIssue: 'Canal spur desilting backlog and solar pump inverter breakdowns',
    trendVelocity: '↑ Emerging (+14% MoM)',
    whyItMatters: 'Extreme heat conditions combined with delayed tank supply rotations create severe water stress across pastoral hamlets.'
  },
  {
    id: 'wayanad',
    name: 'Wayanad Hill Corridor',
    state: 'Kerala',
    district: 'Wayanad',
    cluster: 'Meppadi High Range',
    sector: 'Roads & Mobility',
    gapScore: 38,
    gapStatus: 'LOW',
    citizenRequests: 245,
    exposedPopulation: 18200,
    villagesCount: 6,
    demandIndex: 45,
    infraBaseline: 68,
    investmentCoverage: 72,
    urgencyScore: 52,
    vulnerabilityScore: 40,
    coordinates: { x: 355, y: 460 },
    primaryIssue: 'Slope stabilization needed along tributary access switchbacks',
    trendVelocity: '↓ Decreasing (-5% MoM)',
    whyItMatters: 'Recent state disaster relief tenders have actively addressed culvert reconstruction, keeping net development gap low.'
  }
];

export interface ScenarioIntervention {
  id: string;
  name: string;
  description: string;
  potentialReach: number;
  projectedInfra: { before: number; after: number };
  gapReductionPercent: number;
  capitalIntensity: string;
  transformLabel: string;
  transformSub: string;
  afterPop: number;
  afterReqs: number;
  afterAccessPercent: number;
  projectedGapScore: number;
  popReduced: number;
  reqsAddressed: number;
}

export const NADIA_INTERVENTIONS: Record<string, ScenarioIntervention> = {
  'opt-1': {
    id: 'opt-1',
    name: 'Rural Road Upgrade',
    description: 'Pave all-weather bitumen roads and replace 4 washed-out culverts along the Chapra-Tehatta corridor.',
    potentialReach: 43300,
    projectedInfra: { before: 31, after: 68 },
    gapReductionPercent: 59,
    capitalIntensity: 'High (Demo Tier 3)',
    transformLabel: 'Rural Road Upgrade',
    transformSub: '+37pt Infra · 4 Culverts',
    afterPop: 29100,
    afterReqs: 412,
    afterAccessPercent: 74,
    projectedGapScore: 34,
    popReduced: 43300,
    reqsAddressed: 872
  },
  'opt-2': {
    id: 'opt-2',
    name: 'Drainage & Culvert Improvement',
    description: 'Construct reinforced concrete culverts and storm drains along vulnerable low-lying village segments.',
    potentialReach: 28700,
    projectedInfra: { before: 31, after: 54 },
    gapReductionPercent: 37,
    capitalIntensity: 'Medium (Demo Tier 2)',
    transformLabel: 'Drainage & Culvert Improvement',
    transformSub: '+23pt Infra · 12 Low-lying culverts',
    afterPop: 43700,
    afterReqs: 680,
    afterAccessPercent: 61,
    projectedGapScore: 53,
    popReduced: 28700,
    reqsAddressed: 604
  },
  'opt-3': {
    id: 'opt-3',
    name: 'Alternate Feeder Connector',
    description: 'Upgrade alternate elevated earthen embankment to provide secondary hospital access during flood surges.',
    potentialReach: 19400,
    projectedInfra: { before: 31, after: 49 },
    gapReductionPercent: 29,
    capitalIntensity: 'Low-Medium (Demo Tier 1)',
    transformLabel: 'Alternate Feeder Connector',
    transformSub: '+18pt Infra · Embankment bypass',
    afterPop: 53000,
    afterReqs: 820,
    afterAccessPercent: 52,
    projectedGapScore: 60,
    popReduced: 19400,
    reqsAddressed: 464
  }
};
