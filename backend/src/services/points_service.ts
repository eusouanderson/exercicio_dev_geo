import { db } from '@/db/connect';
import { points } from '@/db/schemas/points';
import { sql } from 'drizzle-orm';

export const getPoints = async (page = 1, limit = 2000) => {
  const offset = (page - 1) * limit;

  const result = await db.select().from(points).limit(limit).offset(offset);

  const totalResult = await db.select({ total: sql`count(*)` }).from(points);
  const total = totalResult[0]?.total ?? 0;

  //console.log(`Total de pontos no banco:`, total);

  return {
    type: 'FeatureCollection',
    features: result,
    total,
    page,
    limit,
  };
};
