import { db } from '@/db/connect';
import { GeoPoint, NewGeoPoint, geoPoints } from '@/db/schemas/geo';
import { eq } from 'drizzle-orm';

export const findAllGeoPoints = async (): Promise<GeoPoint[]> => {
  return db.query.geoPoints.findMany();
};

export const findGeoPointById = async (id: number): Promise<GeoPoint | null> => {
  const [point] = await db.query.geoPoints.findMany({
    where: eq(geoPoints.id, id),
  });
  return point || null;
};

export const createGeoPoint = async (data: NewGeoPoint): Promise<GeoPoint> => {
  const result = await db.insert(geoPoints).values(data).returning();
  return result[0];
};

export const updateGeoPoint = async (
  id: number,
  data: Partial<NewGeoPoint>
): Promise<GeoPoint | null> => {
  const [updated] = await db.update(geoPoints).set(data).where(eq(geoPoints.id, id)).returning();
  return updated || null;
};

export const deleteGeoPoint = async (id: number): Promise<boolean> => {
  const deleted = await db.delete(geoPoints).where(eq(geoPoints.id, id)).returning();
  return deleted.length > 0;
};
