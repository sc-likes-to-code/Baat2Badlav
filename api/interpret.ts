import type { IncomingMessage, ServerResponse } from 'http';
import { handleInterpretRequest } from '../src/server/api/interpretHandler';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return handleInterpretRequest(req, res);
}
