import {
  deleteGeminiResult,
  geminiController,
  getGeminiResult,
  listGeminiResults,
  updateGeminiResult,
} from '@/controllers/gemini_controller';
import { Hono } from 'hono';

const geminiRoute = new Hono();

geminiRoute.post('/gemini', geminiController);
geminiRoute.get('/gemini/results', listGeminiResults);
geminiRoute.get('/gemini/results/:id', getGeminiResult);
geminiRoute.put('/gemini/results/:id', updateGeminiResult);
geminiRoute.delete('/gemini/results/:id', deleteGeminiResult);

export default geminiRoute;
