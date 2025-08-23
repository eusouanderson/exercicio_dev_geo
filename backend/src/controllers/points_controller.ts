import { findAllGeoPoints } from '@/repository/geo_repository';
import { createPoint, findAllPoints } from '@/repository/points_repository';
import { getPoints } from '@/services/points_service';
import { Context } from 'hono';

export const listPoints = async (c: Context) => {
  const page = Math.max(Number(c.req.query('page') || 1), 1);
  const limit = Math.max(Number(c.req.query('limit') || 1000), 1);
  const minCount = Number(c.req.query('minCount') || 0);

  const apiResult = await getPoints(page, limit, minCount);

  const geoPoints = await findAllGeoPoints();

  const existingPoints = await findAllPoints();
  const existingCoords = new Set(existingPoints.map((p) => `${p.lat},${p.lon}`));

  if (apiResult?.features && Array.isArray(apiResult.features)) {
    for (const feature of apiResult.features) {
      const lat = String(feature.geometry.coordinates[1]);
      const lon = String(feature.geometry.coordinates[0]);

      if (!existingCoords.has(`${lat},${lon}`)) {
        const newPoint = {
          lat,
          lon,
          info: feature.properties,
        };
        await createPoint(newPoint);
      }
    }
  }

  return c.json({
    apiPoints: apiResult?.features ?? [],
    geoPoints: geoPoints ?? [],
  });
};
