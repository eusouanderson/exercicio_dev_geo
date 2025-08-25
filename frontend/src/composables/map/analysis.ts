import { getPoints } from "@/services/pointsService";
import type { AnalysisResult } from "@/types/map";
import * as turf from "@turf/turf";
import type { Feature, Point, Polygon } from "geojson";

// Tipo dos pontos que vem do serviço
type GeoPoint = {
  id: number;
  lat: string;
  lon: string;
  info?: Record<string, any>;
  value?: number;
  valor?: number;
  createdAt?: string;
  [key: string]: any;
};

// Interface para dados adicionais
interface AdditionalData {
  censusData: Record<string, number>;
  establishmentStats: {
    total: number;
    construction: number;
    otherPurposes: number;
    [key: string]: number;
  };
  dwellingStats: {
    total: number;
    particular: number;
    [key: string]: number;
  };
  categorySummary: Record<string, number>;
  allProperties: Record<string, number>;
}

export async function analyzePolygon(polygon: Feature<Polygon>): Promise<{
  pointsInside: GeoPoint[];
  analysis: AnalysisResult;
  additionalData: AdditionalData;
}> {
  console.log("🔷 Polígono recebido:", JSON.stringify(polygon, null, 2));

  // Pegar pontos do serviço
  const pointsData = await getPoints();
  const geoPoints: GeoPoint[] = pointsData?.geoPoints ?? [];
  console.log("📦 Retorno de getPoints():", pointsData);
  console.log("📍 Total de pontos recebidos:", geoPoints.length);

  // Converter para Feature<Point> do GeoJSON
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
        coordinates: [Number(p.lon), Number(p.lat)], // GeoJSON: [lng, lat]
      },
      properties: p,
    }));

  // Filtrar pontos que estão dentro do polígono
  const pointsInside: GeoPoint[] = pointsFeatures
    .filter((pointFeature: Feature<Point>) =>
      turf.booleanPointInPolygon(pointFeature, polygon)
    )
    .map((pointFeature: Feature<Point>) => pointFeature.properties as GeoPoint);

  console.log("✅ Pontos dentro:", pointsInside.length);

  // Extrair valores numéricos principais
  const values: number[] = pointsInside
    .map((point: GeoPoint) => Number(point.value ?? point.valor ?? 0))
    .filter((val: number) => !isNaN(val));

  console.log("📊 Valores extraídos:", values);

  // Calcular estatísticas básicas
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

  // Extrair dados adicionais dos pontos
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

// Função para extrair dados adicionais dos pontos
function extractAdditionalData(points: GeoPoint[]): AdditionalData {
  const censusData: Record<string, number> = {};
  const categorySummary: Record<string, number> = {};
  const allProperties: Record<string, number> = {};

  // Inicializar estatísticas de estabelecimentos e domicílios
  const establishmentStats = {
    total: 0,
    construction: 0,
    otherPurposes: 0,
  };

  const dwellingStats = {
    total: 0,
    particular: 0,
  };

  points.forEach((point) => {
    Object.keys(point).forEach((key) => {
      if (
        key !== "latitude" &&
        key !== "longitude" &&
        key !== "id" &&
        key !== "lat" &&
        key !== "lon" &&
        key !== "value" &&
        key !== "valor" &&
        key !== "createdAt" &&
        key !== "info"
      ) {
        const value = Number(point[key]) || 0;

        // Coletar todos os dados de propriedades
        allProperties[key] = (allProperties[key] || 0) + value;

        // Dados específicos do censo
        if (key.includes("censo_")) {
          censusData[key] = (censusData[key] || 0) + value;
        }

        // Categorizar por prefixo
        const category = key.split("_")[0];
        if (category && category !== "censo") {
          categorySummary[category] = (categorySummary[category] || 0) + value;
        }

        // Estatísticas específicas
        if (key.includes("estabelecimento_total")) {
          establishmentStats.total += value;
        }
        if (key.includes("estabelecimento_construcao")) {
          establishmentStats.construction += value;
        }
        if (key.includes("estabelecimento_outras_finalidades")) {
          establishmentStats.otherPurposes += value;
        }
        if (key.includes("domicilio_total")) {
          dwellingStats.total += value;
        }
        if (key.includes("domicilio_particular")) {
          dwellingStats.particular += value;
        }
      }
    });
  });

  return {
    censusData,
    establishmentStats,
    dwellingStats,
    categorySummary,
    allProperties,
  };
}

// Função auxiliar para criar prompt rico para IA
export function createAnalysisPrompt(
  analysis: AnalysisResult,
  additionalData: AdditionalData
): string {
  const { censusData, establishmentStats, dwellingStats } = additionalData;

  return `
Como especialista em análise geoespacial e socioeconômica, analise esta região com base nos seguintes dados:

INFORMAÇÕES GERAIS:
- Total de pontos analisados: ${analysis.totalPoints}
- Valor total: ${analysis.sum}
- Valor médio: ${analysis.mean.toFixed(2)}
- Mediana dos valores: ${analysis.median}

DADOS DO CENSO 2022:
- Total de estabelecimentos: ${establishmentStats.total}
- Estabelecimentos de construção: ${establishmentStats.construction}
- Estabelecimentos com outras finalidades: ${establishmentStats.otherPurposes}
- Total de domicílios: ${dwellingStats.total}
- Domicílios particulares: ${dwellingStats.particular}

DADOS DETALHADOS DO CENSO:
${Object.entries(censusData)
  .filter(([_, value]) => Number(value) > 0)
  .map(([key, value]) => `- ${key.replace(/_/g, " ").toUpperCase()}: ${value}`)
  .join("\n")}

ANÁLISE SOLICITADA:
Por favor, forneça uma análise completa incluindo:
1. Análise socioeconômica da área
2. Potencial de desenvolvimento e investimento
3. Recomendações para intervenções urbanas
4. Comparação com áreas similares
5. Insights sobre a distribuição espacial dos dados
6. Tendências e oportunidades identificadas
`;
}
