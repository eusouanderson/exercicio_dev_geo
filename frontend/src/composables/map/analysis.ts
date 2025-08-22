import type { AnalysisResult } from "@/types/map";
import * as turf from "@turf/turf";
import type { Feature, Polygon } from "geojson"; // <-- ALTERE ESTA LINHA

/**
 * Analisa um polígono para encontrar pontos dentro dele e calcular estatísticas.
 * @param polygonLayer - O polígono desenhado (em formato GeoJSON).
 * @param allPointsData - O array com todos os pontos para análise.
 * @returns Um objeto com os IDs dos pontos internos e os resultados da análise.
 */

export function analyzePolygon(
  polygonGeoJSON: Feature<Polygon>,
  allPointsData: any[]
) {
  const pointsGeoJSON = turf.featureCollection(
    allPointsData.map((p) => turf.point(p.geometry.coordinates, p.properties))
  );

  const ptsWithin = turf.pointsWithinPolygon(pointsGeoJSON, polygonGeoJSON);
  const values = ptsWithin.features
    .map((f: any) => f.properties.value)
    .filter((v): v is number => typeof v === "number");

  if (values.length === 0) {
    const result: AnalysisResult = {
      totalPoints: 0,
      sum: 0,
      mean: 0,
      median: 0,
    };
    return { pointsInside: [], analysis: result };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

  const analysisResult: AnalysisResult = {
    totalPoints: values.length,
    sum: parseFloat(sum.toFixed(2)),
    mean: parseFloat(mean.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
  };

  const pointIdsInside = ptsWithin.features.map((f: any) => f.properties.id);
  return { pointsInside: pointIdsInside, analysis: analysisResult };
}
