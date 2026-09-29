import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleInterpretRequest } from './api/interpretHandler';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for AI interpretation
app.post('/api/interpret', (req, res) => {
  handleInterpretRequest(req, res);
});

// Serve static frontend in production
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
