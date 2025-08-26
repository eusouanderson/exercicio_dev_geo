import { getPoints } from "@/services/pointsService";
import type { AnalysisResult } from "@/types/map";
import * as turf from "@turf/turf";
import type { Feature, Point, Polygon } from "geojson";

type GeoPoint = {
  id: number;
  lat: string;
  lon: string;
  info?: {
    lat?: string;
    lon?: string;
    name?: string;
    type?: string;
    class?: string;
    osm_id?: number;
    address?: {
      state?: string;
      region?: string;
      country?: string;
      country_code?: string;
      municipality?: string;
      "ISO3166-2-lvl4"?: string;
      state_district?: string;
      [key: string]: any;
    };
    licence?: string;
    osm_type?: string;
    place_id?: number;
    importance?: number;
    place_rank?: number;
    addresstype?: string;
    boundingbox?: string[];
    display_name?: string;
    [key: string]: any;
  };
  value?: number;
  valor?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
};

interface AdditionalData {
  locationInfo: {
    municipalities: string[];
    states: string[];
    regions: string[];
    countries: string[];
    displayNames: string[];
    boundingBoxes: string[][];
  };
  establishmentStats: {
    total: number;
    construction: number;
    otherPurposes: number;
  };
  dwellingStats: {
    total: number;
    particular: number;
  };

  demographicData: Record<string, number>;
  infrastructureData: Record<string, number>;
  environmentalData: Record<string, number>;
}

function extractAdditionalData(points: GeoPoint[]): AdditionalData {
  const municipalitiesSet = new Set<string>();
  const statesSet = new Set<string>();
  const regionsSet = new Set<string>();
  const countriesSet = new Set<string>();
  const displayNamesSet = new Set<string>();
  const boundingBoxes: string[][] = [];

  let establishmentsTotal = 0;
  let establishmentsConstruction = 0;
  let establishmentsOtherPurposes = 0;

  let dwellingsTotal = 0;
  let dwellingsParticular = 0;

  const establishmentTypes = new Set([
    "establishment",
    "industrial",
    "commercial",
    "retail",
    "factory",
    "warehouse",
    "office",
    "shop",
    "amenity",
  ]);

  const dwellingTypes = new Set([
    "residential",
    "house",
    "apartments",
    "detached",
    "semidetached_house",
    "terrace",
    "building",
  ]);

  for (const p of points) {
    const info = p.info ?? {};
    const addr = info.address ?? {};

    if (addr.municipality) municipalitiesSet.add(String(addr.municipality));
    if (addr.state) statesSet.add(String(addr.state));
    if (addr.region) regionsSet.add(String(addr.region));
    if (addr.country) countriesSet.add(String(addr.country));
    if (info.display_name) displayNamesSet.add(String(info.display_name));
    if (Array.isArray(info.boundingbox)) {
      boundingBoxes.push(info.boundingbox);
    }

    const cls = (info.class ?? "").toLowerCase();
    const typ = (info.type ?? "").toLowerCase();

    if (
      establishmentTypes.has(typ) ||
      cls === "amenity" ||
      cls === "shop" ||
      cls === "office"
    ) {
      establishmentsTotal += 1;

      if (typ.includes("construction") || cls.includes("construction")) {
        establishmentsConstruction += 1;
      }

      if (!typ.includes("construction")) {
        establishmentsOtherPurposes += 1;
      }
    }

    if (dwellingTypes.has(typ) || cls === "building") {
      dwellingsTotal += 1;

      if (typ === "residential" || typ === "house" || typ === "apartments") {
        dwellingsParticular += 1;
      }
    }
  }

  return {
    locationInfo: {
      municipalities: Array.from(municipalitiesSet),
      states: Array.from(statesSet),
      regions: Array.from(regionsSet),
      countries: Array.from(countriesSet),
      displayNames: Array.from(displayNamesSet),
      boundingBoxes,
    },
    establishmentStats: {
      total: establishmentsTotal,
      construction: establishmentsConstruction,
      otherPurposes: establishmentsOtherPurposes,
    },
    dwellingStats: {
      total: dwellingsTotal,
      particular: dwellingsParticular,
    },
    demographicData: {},
    infrastructureData: {},
    environmentalData: {},
  };
}

export async function analyzePolygon(polygon: Feature<Polygon>): Promise<{
  pointsInside: GeoPoint[];
  analysis: AnalysisResult;
  additionalData: AdditionalData;
}> {
  console.log("🔷 Polígono recebido:", JSON.stringify(polygon, null, 2));

  const pointsData = await getPoints();
  const geoPoints: GeoPoint[] = pointsData?.geoPoints ?? [];
  console.log("📦 Retorno de getPoints():", pointsData);
  console.log("📍 Total de pontos recebidos:", geoPoints.length);

  const pointsFeatures: Feature<Point>[] = geoPoints
    .filter(
      (p: GeoPoint) =>
        p.lat !== undefined &&
        p.lon !== undefined &&
        !isNaN(Number(p.lat)) &&
        !isNaN(Number(p.lon))
    )
    .map((p: GeoPoint) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [Number(p.lon), Number(p.lat)],
      },
      properties: p,
    }));

  const pointsInside: GeoPoint[] = pointsFeatures
    .filter((pointFeature: Feature<Point>) =>
      turf.booleanPointInPolygon(pointFeature, polygon)
    )
    .map((pointFeature: Feature<Point>) => pointFeature.properties as GeoPoint);

  console.log("✅ Pontos dentro:", pointsInside.length);

  const values: number[] = pointsInside
    .map((point: GeoPoint) => Number(point.value ?? point.valor))
    .filter((val: number) => !isNaN(val));

  console.log("📊 Valores extraídos:", values);

  const totalPoints = pointsInside.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = totalPoints ? sum / totalPoints : 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  const median =
    sortedValues.length === 0
      ? 0
      : sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];

  const additionalData = extractAdditionalData(pointsInside);

  return {
    pointsInside,
    analysis: {
      totalPoints,
      sum,
      mean,
      median,
      values,
    },
    additionalData,
  };
}

export function createAnalysisPromptFromPoints(
  pointsInside: GeoPoint[]
): string {
  if (!pointsInside.length) {
    return "Nenhum ponto encontrado dentro do polígono para análise.";
  }

  const pontosDescritos = pointsInside.map((p) => {
    const info = p.info || {};
    const address = info.address || {};
    return {
      id: p.id,
      name: info.name || "N/A",
      type: info.type || info.class || "N/A",
      location: { lat: p.lat, lon: p.lon },
      importance: info.importance ?? "N/A",
      rank: info.place_rank ?? "N/A",
      region: address.region ?? "N/A",
      country: address.country ?? "N/A",
    };
  });

  return `
Você é um especialista em geografia, urbanismo e desenvolvimento regional.
Receba os seguintes pontos dentro de um polígono: ${JSON.stringify(
    pontosDescritos
  )}.

Regras de análise:
- Forneça apenas análise socioeconômica, demográfica, histórica, cultural, ambiental e oportunidades de desenvolvimento.
- Não repita informações básicas já fornecidas.
- Não use markdown, títulos ou listas.
- Seja objetiva e direta, em texto corrido.
- Faça comparações quando relevante com regiões similares no Brasil e no mundo.
- Inclua insights estratégicos de infraestrutura, planejamento territorial e economia local.
  `;
}
