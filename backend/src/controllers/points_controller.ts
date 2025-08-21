import { getPoints } from '@/services/points_service';
import { Context } from 'hono';

export const listPoints = async (c: Context) => {
  const page = Math.max(Number(c.req.query('page') || 1), 1);
  const limit = Math.max(Number(c.req.query('limit') || 500), 1);
  const minCount = Number(c.req.query('minCount') || 0);

  const result = await getPoints(page, limit, minCount);
  return c.json(result);
};
