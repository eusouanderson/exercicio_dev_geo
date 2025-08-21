import fs from 'fs';
import Papa from 'papaparse';
import path from 'path';

let cachedPoints: any = null;

export const clearCache = () => {
  cachedPoints = null;
};

export const loadPointsData = async (filePath?: string) => {
  if (cachedPoints) return cachedPoints;

  try {
    const resolvedPath =
      filePath || process.env.FILE_PATH || path.resolve('../files/base_jales_separado_virgula.csv');

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Arquivo CSV não encontrado em: ${resolvedPath}`);
    }

    const csvText = await Bun.file(resolvedPath).text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      console.error('Erros ao processar o CSV:', parsed.errors);
      return { type: 'FeatureCollection', features: [] };
    }

    const geoJsonPoints = parsed.data.map((row: any) => ({
      type: 'Feature',
      properties: { ...row },
      geometry: {
        type: 'Point',
        coordinates: [row.longitude, row.latitude],
      },
    }));

    cachedPoints = { type: 'FeatureCollection', features: geoJsonPoints };
    return cachedPoints;
  } catch (error: any) {
    console.error('Falha ao carregar pontos:', error.message || error);
    return { type: 'FeatureCollection', features: [] };
  }
};
