import { db } from '@/db/connect';
import { GeoPoint, NewGeoPoint, geoPoints } from '@/db/schemas/geo';

export const findAllGeoPoints = async (): Promise<GeoPoint[]> => {
  return db.query.geoPoints.findMany();
};

export const createGeoPoint = async (data: NewGeoPoint): Promise<GeoPoint> => {
  const result = await db.insert(geoPoints).values(data).returning();
  return result[0];
};
