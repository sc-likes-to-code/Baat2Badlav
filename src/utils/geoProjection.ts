/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Geometric bounding box & projection calibration for the provided India Map base image.
 * Map Image Native Resolution: 884 x 1024 pixels.
 * 
 * Geographic Calibration Extents:
 * - Western Longitude: 67.2° E (West of Gujarat Rann of Kutch)
 * - Eastern Longitude: 97.6° E (East of Arunachal Pradesh Kibithu)
 * - Northern Latitude: 37.3° N (North of Ladakh / Indira Col)
 * - Southern Latitude: 5.8° N (South of Great Nicobar / bottom margin)
 */
export const MAP_IMAGE_WIDTH = 884;
export const MAP_IMAGE_HEIGHT = 1024;
export const MAP_ASPECT_RATIO = MAP_IMAGE_WIDTH / MAP_IMAGE_HEIGHT;

export const GEO_BOUNDS = {
  lonMin: 67.2,
  lonMax: 97.6,
  latMin: 5.8,
  latMax: 37.3,
};

export interface GeoLocation {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  referencePoint: string;
}

/**
 * Deterministic conversion from geographic coordinates (latitude, longitude)
 * into the 884 x 1024 SVG / Canvas coordinate space.
 */
export function geoToSvgCoordinates(latitude: number, longitude: number): { x: number; y: number } {
  const x = ((longitude - GEO_BOUNDS.lonMin) / (GEO_BOUNDS.lonMax - GEO_BOUNDS.lonMin)) * MAP_IMAGE_WIDTH;
  const y = ((GEO_BOUNDS.latMax - latitude) / (GEO_BOUNDS.latMax - GEO_BOUNDS.latMin)) * MAP_IMAGE_HEIGHT;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

/**
 * Converts geographic coordinates to percentage strings for CSS/absolute overlays.
 */
export function geoToPercentCoordinates(latitude: number, longitude: number): { left: string; top: string; xPct: number; yPct: number } {
  const { x, y } = geoToSvgCoordinates(latitude, longitude);
  const xPct = Math.round((x / MAP_IMAGE_WIDTH) * 1000) / 10;
  const yPct = Math.round((y / MAP_IMAGE_HEIGHT) * 1000) / 10;

  return {
    left: `${xPct}%`,
    top: `${yPct}%`,
    xPct,
    yPct,
  };
}

/**
 * Verified Geographic Location Registry
 * Ground-truth coordinates for all prototype districts and reference points.
 */
export const VERIFIED_LOCATIONS: Record<string, GeoLocation> = {
  nadia: {
    id: 'nadia',
    name: 'Nadia Basin',
    district: 'Nadia',
    state: 'West Bengal',
    latitude: 23.471,
    longitude: 88.556,
    referencePoint: 'Krishnanagar / Nadia district center',
  },
  murshidabad: {
    id: 'murshidabad',
    name: 'Murshidabad Central',
    district: 'Murshidabad',
    state: 'West Bengal',
    latitude: 24.175,
    longitude: 88.280,
    referencePoint: 'Berhampore / Murshidabad district center',
  },
  gaya: {
    id: 'gaya',
    name: 'Gaya Rural Belt',
    district: 'Gaya',
    state: 'Bihar',
    latitude: 24.795,
    longitude: 84.999,
    referencePoint: 'Gaya district headquarters',
  },
  muzaffarpur: {
    id: 'muzaffarpur',
    name: 'Muzaffarpur Corridor',
    district: 'Muzaffarpur',
    state: 'Bihar',
    latitude: 26.120,
    longitude: 85.390,
    referencePoint: 'Muzaffarpur district headquarters',
  },
  kalahandi: {
    id: 'kalahandi',
    name: 'Kalahandi Basin',
    district: 'Kalahandi',
    state: 'Odisha',
    latitude: 19.907,
    longitude: 83.164,
    referencePoint: 'Bhawanipatna / Kalahandi district center',
  },
  barmer: {
    id: 'barmer',
    name: 'Barmer Desert Tract',
    district: 'Barmer',
    state: 'Rajasthan',
    latitude: 25.752,
    longitude: 71.396,
    referencePoint: 'Barmer district headquarters',
  },
  wayanad: {
    id: 'wayanad',
    name: 'Wayanad Hill Corridor',
    district: 'Wayanad',
    state: 'Kerala',
    latitude: 11.685,
    longitude: 76.132,
    referencePoint: 'Kalpetta / Wayanad district center',
  },
  patna: {
    id: 'patna',
    name: 'Patna Peri-Urban',
    district: 'Patna',
    state: 'Bihar',
    latitude: 25.610,
    longitude: 85.141,
    referencePoint: 'Patna administrative center',
  },
  malda: {
    id: 'malda',
    name: 'Malda Riverine',
    district: 'Malda',
    state: 'West Bengal',
    latitude: 25.011,
    longitude: 88.141,
    referencePoint: 'English Bazar / Malda center',
  },
};

/**
 * Returns the verified SVG coordinates for any registered district or falls back to standard projection.
 */
export function getHotspotCoordinates(districtId: string, fallbackLat = 23.0, fallbackLon = 80.0): { x: number; y: number } {
  const loc = VERIFIED_LOCATIONS[districtId.toLowerCase()];
  if (loc) {
    return geoToSvgCoordinates(loc.latitude, loc.longitude);
  }
  return geoToSvgCoordinates(fallbackLat, fallbackLon);
}

/**
 * Sub-regional analytical corridor segments connecting related development clusters.
 */
export interface CorridorSegment {
  id: string;
  fromId: string;
  toId: string;
  name: string;
  type: 'eastern_feeder' | 'gangetic_axis' | 'coastal_link';
}

export const SPATIAL_CORRIDORS: CorridorSegment[] = [
  {
    id: 'corridor-bihar-axis',
    fromId: 'muzaffarpur',
    toId: 'gaya',
    name: 'North-South Bihar Development Axis',
    type: 'gangetic_axis',
  },
  {
    id: 'corridor-ganga-bengal',
    fromId: 'gaya',
    toId: 'murshidabad',
    name: 'Gangetic Plains to Bhagirathi Corridor',
    type: 'eastern_feeder',
  },
  {
    id: 'corridor-bengal-basin',
    fromId: 'murshidabad',
    toId: 'nadia',
    name: 'Bhagirathi-Hooghly Sub-Regional Corridor',
    type: 'eastern_feeder',
  },
  {
    id: 'corridor-odisha-link',
    fromId: 'gaya',
    toId: 'kalahandi',
    name: 'Eastern Hinterland Inter-State Feeder',
    type: 'eastern_feeder',
  },
];
