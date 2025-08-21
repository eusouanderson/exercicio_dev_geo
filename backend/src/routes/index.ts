import fs from 'fs';
import { Hono } from 'hono';
import Papa from 'papaparse';
import path from 'path';

const apiRoutes = new Hono();

let cachedPoints: any = null;

const loadPointsData = async () => {
  if (cachedPoints) return cachedPoints;

  try {
    const filePath =
      process.env.FILE_PATH || path.resolve('../files/base_jales_separado_virgula.csv');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo CSV não encontrado em: ${filePath}`);
    }

    const csvText = await Bun.file(filePath).text();
    console.log('Conteúdo do CSV:', csvText.slice(0, 500), '...');

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      console.error('Erros ao processar o CSV:', parsed.errors);
      return { type: 'FeatureCollection', features: [] };
    }

    console.log('Dados parseados:', parsed.data.slice(0, 5));

    // criando um geojson
    const geoJsonPoints = parsed.data.map((row: any) => ({
      type: 'Feature',
      properties: { ...row }, // peguei todas
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude],
      },
    }));
    console.log('geojsonn gerado:', geoJsonPoints.slice(0, 5));
    cachedPoints = { type: 'FeatureCollection', features: geoJsonPoints };
    return cachedPoints;
  } catch (error: any) {
    console.error('falha ao carregar pontos:', error.message || error);
    return { type: 'FeatureCollection', features: [] };
  }
};
// endpoint
apiRoutes.get('/points', async (c) => {
  const page = Math.max(Number(c.req.query('page') || 1), 1);
  const limit = Math.max(Number(c.req.query('limit') || 500), 1);
  const minCount = Number(c.req.query('minCount') || 0);
  const pointsData = await loadPointsData();

  // filtrando o censo
  let filtered = pointsData.features.filter(
    (f: any) => f.properties.censo_2022_domicilio_particular_poi_counts >= minCount
  );
  // esquema para paginação
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = filtered.slice(start, end);

  return c.json({
    type: 'FeatureCollection',
    features: paged,
    total: filtered.length,
    page,
    limit,
  });
});

export default apiRoutes;
