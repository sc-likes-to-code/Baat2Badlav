export interface StateOption {
  id: string;
  name: string;
}

export interface DistrictOption {
  id: string;
  name: string;
}

export const PROTOTYPE_STATES: StateOption[] = [
  { id: 'WB', name: 'West Bengal' },
  { id: 'BR', name: 'Bihar' },
  { id: 'OD', name: 'Odisha' },
  { id: 'RJ', name: 'Rajasthan' },
  { id: 'KL', name: 'Kerala' },
  { id: 'JH', name: 'Jharkhand' },
];

export const PROTOTYPE_DISTRICTS_BY_STATE: Record<string, DistrictOption[]> = {
  WB: [
    { id: 'nadia', name: 'Nadia' },
    { id: 'murshidabad', name: 'Murshidabad' },
    { id: 'malda', name: 'Malda' },
    { id: 'north_24_parganas', name: 'North 24 Parganas' },
    { id: 'south_24_parganas', name: 'South 24 Parganas' },
    { id: 'hooghly', name: 'Hooghly' },
  ],
  BR: [
    { id: 'gaya', name: 'Gaya' },
    { id: 'patna', name: 'Patna' },
    { id: 'muzaffarpur', name: 'Muzaffarpur' },
    { id: 'bhagalpur', name: 'Bhagalpur' },
  ],
  OD: [
    { id: 'kalahandi', name: 'Kalahandi' },
    { id: 'koraput', name: 'Koraput' },
    { id: 'rayagada', name: 'Rayagada' },
    { id: 'cuttack', name: 'Cuttack' },
  ],
  RJ: [
    { id: 'barmer', name: 'Barmer' },
    { id: 'jaisalmer', name: 'Jaisalmer' },
    { id: 'bikaner', name: 'Bikaner' },
    { id: 'jodhpur', name: 'Jodhpur' },
  ],
  KL: [
    { id: 'wayanad', name: 'Wayanad' },
    { id: 'idukki', name: 'Idukki' },
    { id: 'palakkad', name: 'Palakkad' },
    { id: 'kozhikode', name: 'Kozhikode' },
  ],
  JH: [
    { id: 'ranchi', name: 'Ranchi' },
    { id: 'dhanbad', name: 'Dhanbad' },
    { id: 'east_singhbhum', name: 'East Singhbhum' },
    { id: 'dumka', name: 'Dumka' },
  ],
};

export function getDistrictsForState(stateId: string): DistrictOption[] {
  return PROTOTYPE_DISTRICTS_BY_STATE[stateId] || [];
}

export function getStateName(stateId: string): string {
  const found = PROTOTYPE_STATES.find((s) => s.id === stateId);
  return found ? found.name : stateId;
}

export function getDistrictName(stateId: string, districtId: string): string {
  const list = getDistrictsForState(stateId);
  const found = list.find((d) => d.id === districtId);
  return found ? found.name : districtId;
}

export function getDefaultDistrictForState(stateId: string): string {
  const list = getDistrictsForState(stateId);
  return list.length > 0 ? list[0].id : '';
}
