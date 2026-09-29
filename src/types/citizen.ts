export type LanguageCode = 'bn' | 'hi' | 'en';

export type InputMode = 'voice' | 'text';

export type CivicCategory =
  | 'Roads & Mobility'
  | 'Water Access'
  | 'Healthcare Access'
  | 'Electricity & Power'
  | 'School Facilities'
  | 'Other';

export interface CitizenLocation {
  country: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  locality?: string;
}

export interface CitizenSubmission {
  id: string;
  language: LanguageCode;
  inputMode: InputMode;
  text: string;
  location: CitizenLocation;
  category: CivicCategory;
  createdAt: string;
  recordingDurationSeconds?: number;
}

export interface CitizenFormDraft {
  language: LanguageCode;
  inputMode: InputMode;
  text: string;
  stateId: string;
  districtId: string;
  locality: string;
  category: CivicCategory | '';
  isRecording: boolean;
  isPaused: boolean;
  recordingSeconds: number;
}

export interface CitizenFormValidationErrors {
  text?: string;
  stateId?: string;
  districtId?: string;
  category?: string;
  piiWarning?: string;
}

export interface CitizenAIInterpretation {
  detectedLanguage: string;
  detectedLanguageCode: string;
  civicDomain: string;
  primaryIssue: string;
  normalizedSummary: string;
  entitiesOrSignals: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  urgency: 'Routine' | 'Seasonal Risk' | 'Immediate' | 'Long-term';
  urgencyAssessment: string;
  urgencyReasoning: string;
  extractedLocations: string[];
  confidence: number; // 0.0 to 1.0 (interpretation clarity)
  confidenceBasis: string;
  safetyNotice?: string;
}

export interface InterpretApiResponse {
  success: boolean;
  data?: CitizenAIInterpretation;
  error?: string;
  code?: string;
}
