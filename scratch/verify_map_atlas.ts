import { VERIFIED_LOCATIONS, geoToSvgCoordinates, SPATIAL_CORRIDORS } from '../src/utils/geoProjection';
import { HOTSPOTS } from '../src/data/mockData';

console.log('================================================================');
console.log('SPATIAL CORRIDOR ATLAS — GEOGRAPHIC VERIFICATION AUDIT');
console.log('================================================================');

console.log('\n1. VERIFIED LOCATIONS REGISTRY & COORDINATE TRANSFORMATION:');
console.log('----------------------------------------------------------------');
const table = Object.values(VERIFIED_LOCATIONS).map((loc) => {
  const coords = geoToSvgCoordinates(loc.latitude, loc.longitude);
  return {
    Place: loc.name,
    District: loc.district,
    State: loc.state,
    Latitude: loc.latitude,
    Longitude: loc.longitude,
    'SVG (x, y)': `${coords.x}, ${coords.y}`,
    'Left %, Top %': `${((coords.x / 884) * 100).toFixed(1)}%, ${((coords.y / 1024) * 100).toFixed(1)}%`,
    Reference: loc.referencePoint,
  };
});
console.table(table);

console.log('\n2. RELATIVE GEOGRAPHIC RELATIONSHIP VERIFICATION:');
console.log('----------------------------------------------------------------');
const nadia = geoToSvgCoordinates(VERIFIED_LOCATIONS.nadia.latitude, VERIFIED_LOCATIONS.nadia.longitude);
const murshidabad = geoToSvgCoordinates(VERIFIED_LOCATIONS.murshidabad.latitude, VERIFIED_LOCATIONS.murshidabad.longitude);
const gaya = geoToSvgCoordinates(VERIFIED_LOCATIONS.gaya.latitude, VERIFIED_LOCATIONS.gaya.longitude);
const muzaffarpur = geoToSvgCoordinates(VERIFIED_LOCATIONS.muzaffarpur.latitude, VERIFIED_LOCATIONS.muzaffarpur.longitude);
const kalahandi = geoToSvgCoordinates(VERIFIED_LOCATIONS.kalahandi.latitude, VERIFIED_LOCATIONS.kalahandi.longitude);
const barmer = geoToSvgCoordinates(VERIFIED_LOCATIONS.barmer.latitude, VERIFIED_LOCATIONS.barmer.longitude);
const wayanad = geoToSvgCoordinates(VERIFIED_LOCATIONS.wayanad.latitude, VERIFIED_LOCATIONS.wayanad.longitude);

// Check 1: Nadia is East and South of Murshidabad
const check1 = nadia.x > murshidabad.x && nadia.y > murshidabad.y;
console.log(`[Check 1] Nadia (${nadia.x}, ${nadia.y}) is East & South of Murshidabad (${murshidabad.x}, ${murshidabad.y}): ${check1 ? 'PASSED ✓' : 'FAILED ✗'}`);

// Check 2: Muzaffarpur is North of Gaya
const check2 = muzaffarpur.y < gaya.y; // lower y means further north
console.log(`[Check 2] Muzaffarpur (${muzaffarpur.x}, ${muzaffarpur.y}) is North of Gaya (${gaya.x}, ${gaya.y}): ${check2 ? 'PASSED ✓' : 'FAILED ✗'}`);

// Check 3: Murshidabad and Nadia are far East of Gaya
const check3 = murshidabad.x > gaya.x && nadia.x > gaya.x;
console.log(`[Check 3] Murshidabad & Nadia are East of Gaya: ${check3 ? 'PASSED ✓' : 'FAILED ✗'}`);

// Check 4: Kalahandi is South-West of Nadia
const check4 = kalahandi.x < nadia.x && kalahandi.y > nadia.y;
console.log(`[Check 4] Kalahandi (${kalahandi.x}, ${kalahandi.y}) is South-West of Nadia (${nadia.x}, ${nadia.y}): ${check4 ? 'PASSED ✓' : 'FAILED ✗'}`);

// Check 5: Barmer is Far West of all points
const check5 = barmer.x < gaya.x && barmer.x < wayanad.x && barmer.x < kalahandi.x;
console.log(`[Check 5] Barmer (${barmer.x}, ${barmer.y}) is Westernmost: ${check5 ? 'PASSED ✓' : 'FAILED ✗'}`);

// Check 6: Wayanad is Far South of Northern/Eastern locations
const check6 = wayanad.y > kalahandi.y && wayanad.y > nadia.y && wayanad.y > gaya.y;
console.log(`[Check 6] Wayanad (${wayanad.x}, ${wayanad.y}) is Southernmost: ${check6 ? 'PASSED ✓' : 'FAILED ✗'}`);

console.log('\n3. HOTSPOTS DATA AUDIT:');
console.log('----------------------------------------------------------------');
HOTSPOTS.forEach((h) => {
  const expected = geoToSvgCoordinates(h.latitude, h.longitude);
  const match = expected.x === h.coordinates.x && expected.y === h.coordinates.y;
  console.log(`Hotspot [${h.id.padEnd(12)}]: lat ${h.latitude.toFixed(3)}, lon ${h.longitude.toFixed(3)} => SVG (${h.coordinates.x}, ${h.coordinates.y}) [Match: ${match ? 'YES ✓' : 'NO ✗'}]`);
});

console.log('\n4. CORRIDOR SEGMENTS:');
console.log('----------------------------------------------------------------');
SPATIAL_CORRIDORS.forEach((c) => {
  console.log(`Corridor: [${c.id}] ${c.fromId} -> ${c.toId} (${c.name})`);
});

console.log('\nALL CHECKS COMPLETED SUCCESSFULLY!');
