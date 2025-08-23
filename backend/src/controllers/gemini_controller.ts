import { analyzeGeographyPrompt } from '@/services/chatgemini_service';
import { Context } from 'hono';

export async function geminiController(c: Context) {
  try {
    const { prompt } = await c.req.json();
    const result = await analyzeGeographyPrompt(prompt);
    return c.json({ result });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
}
