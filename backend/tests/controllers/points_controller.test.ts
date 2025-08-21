import { listPoints } from '@/controllers/points_controller';
import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';

//garante que o endpoint /points retorna um objeto GeoJSON
//garante a propriedade "features" e com o limite de pontos
describe('Points Controller', () => {
  it('should return JSON with points', async () => {
    const app = new Hono();
    app.get('/points', listPoints);

    const res = await app.request('/points?page=1&limit=5');
    expect(res.status).toBe(200);

    const data = (await res.json()) as { features: any[] };

    expect(data).toHaveProperty('features');
    expect(data.features.length).toBeLessThanOrEqual(5);
  });
});
