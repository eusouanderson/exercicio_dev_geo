import { findAllGeoPoints } from '@/repository/geo_repository';
import { createPoint, findPointByCoords } from '@/repository/points_repository';
import { getPoints } from '@/services/points_service';
import { Context } from 'hono';

interface CoordCacheEntry {
  expires: number;
}

const coordCache: Record<string, CoordCacheEntry> = {};
const CACHE_TTL = 60 * 1000;

export const listPoints = async (c: Context) => {
  const page = Math.max(Number(c.req.query('page') || 1), 1);
  const limit = Math.max(Number(c.req.query('limit') || 2000), 1);

  const apiResult = await getPoints(page, limit);
  const geoPoints = await findAllGeoPoints();
  const geoJsonFeatures = [];

  if (apiResult?.features && Array.isArray(apiResult.features)) {
    for (const point of apiResult.features) {
      const lat = point.lat;
      const lon = point.lon;
      const coordKey = `${lat}-${lon}`;
      const now = Date.now();

      if (!coordCache[coordKey] || coordCache[coordKey].expires < now) {
        const existing = await findPointByCoords(lat, lon);
        if (!existing) {
          await createPoint({
            lat,
            lon,
            info: point.info,
          });
        }

        coordCache[coordKey] = { expires: now + CACHE_TTL };
      }

      geoJsonFeatures.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(lon), Number(lat)] },
        properties: point.info,
      });
    }
  }

  return c.json({
    apiPoints: geoJsonFeatures,
    geoPoints: geoPoints ?? [],
    total: apiResult.total,
    page: apiResult.page,
    limit: apiResult.limit,
  });
};
