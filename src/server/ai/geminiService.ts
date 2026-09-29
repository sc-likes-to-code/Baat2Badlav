import { GoogleGenAI } from '@google/genai';
import { CitizenSubmission, CitizenAIInterpretation } from '../../types/citizen.ts';
import { GEMINI_MODEL, getGeminiApiKey } from './config.ts';
import {
  CIVIC_INTERPRETATION_SYSTEM_INSTRUCTION,
  CIVIC_INTERPRETATION_SCHEMA,
} from './civicInterpretationPrompt.ts';

// Bounded timeout architecture:
// SDK HTTP timeout: 30s | Server safety wrapper: 35s | Browser fetch timeout: 40s
const SDK_HTTP_TIMEOUT_MS = 30000;
const SERVER_WRAPPER_TIMEOUT_MS = 35000;

/**
 * Server-side function that sends an unverified citizen submission to Gemini 3.5 Flash Lite (gemini-3.5-flash-lite)
 * using @google/genai with native SDK HTTP timeout, structured JSON output, and minimal thinking.
 */
export async function interpretCitizenSubmission(
  submission: CitizenSubmission
): Promise<CitizenAIInterpretation> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your .env.local file to enable live AI interpretation.'
    );
  }

  if (!submission || !submission.text || !submission.text.trim()) {
    throw new Error('Invalid citizen submission: Submission text is required.');
  }

  // Initialize SDK with native HTTP timeout configuration
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: SDK_HTTP_TIMEOUT_MS,
    },
  });

  const prompt = `
Interpret the following unverified citizen report from India and extract structured civic intelligence:

CITIZEN-SELECTED METADATA:
- Selected Language: ${submission.language}
- Input Mode: ${submission.inputMode}
- Selected Category: ${submission.category || 'Not specified'}
- Citizen-Selected Location:
  * State: ${submission.location?.stateName || 'India'} (${submission.location?.stateId || ''})
  * District: ${submission.location?.districtName || 'Unspecified'} (${submission.location?.districtId || ''})
  * Locality / Village: ${submission.location?.locality || 'Not specified'}

CITIZEN STATED REPORT (UNVERIFIED):
"""
${submission.text}
"""

Please structure this citizen report into structured civic interpretation adhering strictly to the JSON schema.
`;

  // Server-level safety timer wrapper (35s)
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `Gemini interpretation request timed out after ${SERVER_WRAPPER_TIMEOUT_MS / 1000} seconds. Please try again.`
        )
      );
    }, SERVER_WRAPPER_TIMEOUT_MS);
    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  });

  const generatePromise = ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: CIVIC_INTERPRETATION_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: CIVIC_INTERPRETATION_SCHEMA as any,
      thinkingConfig: {
        thinkingLevel: 'MINIMAL' as any,
      },
    },
  });

  const response = await Promise.race([generatePromise, timeoutPromise]);

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    const parsedData = JSON.parse(responseText) as CitizenAIInterpretation;
    return parsedData;
  } catch (err: any) {
    console.error('Failed to parse Gemini JSON output:', responseText);
    throw new Error(`Failed to parse structured AI output: ${err.message}`);
  }
}
