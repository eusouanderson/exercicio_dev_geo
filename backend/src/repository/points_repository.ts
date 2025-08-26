import { db } from '@/db/connect';
import { NewPoint, points, sPoints } from '@/db/schemas/points';
import { and, eq } from 'drizzle-orm';

export const findAllPoints = async (): Promise<sPoints[]> => {
  return db.select().from(points);
};

export const createPoint = async (data: NewPoint): Promise<sPoints> => {
  const [result] = await db.insert(points).values(data).returning();
  return result;
};

export const findPointByCoords = async (lat: string, lon: string): Promise<sPoints | undefined> => {
  const [result] = await db
    .select()
    .from(points)
    .where(and(eq(points.lat, lat), eq(points.lon, lon)));

  return result;
};
