import { db } from '@/db/connect';
import { NewPoint, points, sPoints } from '@/db/schemas/points';

export const findAllPoints = async (): Promise<sPoints[]> => {
  return db.select().from(points);
};

export const createPoint = async (data: NewPoint): Promise<sPoints> => {
  const [result] = await db.insert(points).values(data).returning();
  return result;
};
