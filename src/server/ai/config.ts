/**
 * Server-side Gemini AI Configuration for Baat2Badlav
 * Note: GEMINI_API_KEY is only accessed on the server side to protect secrets.
 */

export const GEMINI_MODEL = 'gemini-3.5-flash-lite';

export function getGeminiApiKey(): string | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '""' || apiKey === "''") {
    return null;
  }
  return apiKey;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}
