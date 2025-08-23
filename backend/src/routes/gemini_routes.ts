import { geminiController } from '@/controllers/gemini_controller';
import { Hono } from 'hono';

const geminiRoute = new Hono();

geminiRoute.post('/gemini', geminiController);

export default geminiRoute;
