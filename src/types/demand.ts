/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicCategory } from './citizen';

export interface ClusterLocation {
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  locality?: string;
  reportCount: number;
}

export interface SeverityDistribution {
  Low: number;
  Medium: number;
  High: number;
  Critical: number;
}

export interface UrgencyDistribution {
  Routine: number;
  'Seasonal Risk': number;
  Immediate: number;
  'Long-term': number;
}

export interface DemandCluster {
  id: string;
  civicDomain: CivicCategory;
  title: string;
  normalizedDemand: string;
  reportCount: number;
  locations: ClusterLocation[];
  severityDistribution: SeverityDistribution;
  urgencyDistribution: UrgencyDistribution;
  representativeSignals: string[];
  confidence: number;
  memberReportIds: string[];
}

export interface DemandHotspot {
  id: string;
  clusterId: string;
  district: string;
  districtId: string;
  state: string;
  stateId: string;
  domain: CivicCategory;
  demandTitle: string;
  normalizedDemand: string;
  reportCount: number;
  severityDistribution: SeverityDistribution;
  urgencyDistribution: UrgencyDistribution;
  representativeSignals: string[];
  confidence: number;
  localities: string[];
}
