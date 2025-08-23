import { booleanPointInPolygon, point, polygon } from '@turf/turf';

export function isPointInPolygon(pointCoords: [number, number], polygonCoords: [number, number][]) {
  const pt = point(pointCoords);
  const poly = polygon([polygonCoords]);
  return booleanPointInPolygon(pt, poly);
}
