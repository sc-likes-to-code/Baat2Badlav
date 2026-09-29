/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectType =
  | 'Road Rehabilitation'
  | 'Drainage Improvement'
  | 'Bridge & Culvert Rehabilitation'
  | 'Water Access Improvement'
  | 'Water Quality Intervention'
  | 'Primary Healthcare Access'
  | 'Electricity Reliability Improvement'
  | 'School Sanitation Improvement'
  | 'School Infrastructure Rehabilitation'
  | 'Other Development Intervention';

export interface CandidateProject {
  id: string;

  priorityAssessmentId: string;
  developmentGapId: string;

  districtId: string;
  districtName: string;
  stateId: string;
  stateName: string;

  civicDomain: string;
  demandTitle: string;

  projectType: ProjectType;
  projectTitle: string;

  description: string;

  targetNeed: string;

  supportingEvidence: {
    reportCount: number;
    priorityScore: number;
    developmentGapScore: number;
    severitySignal: number;
    urgencySignal: number;
    infrastructureNeed: number;
    demographicPressure: number;
    investmentGap: number;
  };

  rationale: string;

  implementationConsiderations: string[];

  dataQuality: 'Synthetic Demonstration Data';
}
