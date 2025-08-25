import {
  analyzeGeographyPrompt,
  deleteResult,
  getResultById,
  listResults,
  updateResult,
} from '@/services/chatgemini_service';
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

export async function listGeminiResults(c: Context) {
  try {
    const results = await listResults();
    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function getGeminiResult(c: Context) {
  try {
    const id = Number(c.req.param('id'));
    const result = await getResultById(id);
    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function updateGeminiResult(c: Context) {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const updated = await updateResult(id, body);
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function deleteGeminiResult(c: Context) {
  try {
    const id = Number(c.req.param('id'));
    const success = await deleteResult(id);
    if (!success) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
}
