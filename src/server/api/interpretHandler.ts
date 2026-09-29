import type { IncomingMessage, ServerResponse } from 'http';
import { interpretCitizenSubmission } from '../ai/geminiService.ts';
import { getGeminiApiKey } from '../ai/config.ts';
import { CitizenSubmission, CitizenAIInterpretation } from '../../types/citizen.ts';

// Server-side in-flight request deduplication map to prevent multiple Gemini calls for identical submission IDs
const inFlightRequests = new Map<string, Promise<CitizenAIInterpretation>>();

/**
 * Handles POST /api/interpret requests
 */
export async function handleInterpretRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('error', (err) => {
    console.error('[API /api/interpret] Request stream error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Request stream error.' }));
  });

  req.on('end', async () => {
    try {
      if (!body) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Request body is empty.' }));
        return;
      }

      let payload: any;
      try {
        payload = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload in request.' }));
        return;
      }

      const submission = payload.submission as CitizenSubmission;
      if (!submission || !submission.text || typeof submission.text !== 'string' || !submission.text.trim()) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            error: 'Missing or invalid submission. Submission text is required.',
          })
        );
        return;
      }

      // Check if Gemini API key is configured
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            success: false,
            code: 'MISSING_API_KEY',
            error:
              'Gemini API key is not configured on the server. Please add your GEMINI_API_KEY in .env.local to enable live AI interpretation.',
          })
        );
        return;
      }

      // Check if this submission ID is already in flight on the server
      let interpretationPromise = inFlightRequests.get(submission.id);
      if (!interpretationPromise) {
        console.log(`[API /api/interpret] Processing submission ${submission.id} (Category: "${submission.category || 'N/A'}", State: "${submission.location?.stateName || 'N/A'}")`);
        interpretationPromise = interpretCitizenSubmission(submission).finally(() => {
          inFlightRequests.delete(submission.id);
        });
        inFlightRequests.set(submission.id, interpretationPromise);
      } else {
        console.log(`[API /api/interpret] Joining existing in-flight interpretation for submission ${submission.id}`);
      }

      // Await the deduplicated promise
      const interpretation = await interpretationPromise;

      console.log(`[API /api/interpret] Successfully interpreted submission ${submission.id} (Domain: "${interpretation.civicDomain}", Confidence: ${interpretation.confidence})`);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          data: interpretation,
        })
      );
    } catch (error: any) {
      console.error('[API /api/interpret] Server error:', error?.message || error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: error?.message || 'An unexpected error occurred during AI interpretation.',
        })
      );
    }
  });
}
