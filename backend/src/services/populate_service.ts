import { createPoint, findPointByCoords } from '@/repository/points_repository';
import { loadPointsData } from '@/utils/csv_loader';

export const populatePoints = async () => {
  const pointsData = await loadPointsData();

  console.log(`Total de pontos no CSV: ${pointsData.features.length}`);

  for (const feature of pointsData.features) {
    const lat = String(Number(feature.geometry.coordinates[1]).toFixed(6));
    const lon = String(Number(feature.geometry.coordinates[0]).toFixed(6));

    // Evita duplicados
    const existing = await findPointByCoords(lat, lon);
    if (!existing) {
      await createPoint({
        lat,
        lon,
        info: feature.properties,
      });
    }
  }

  console.log('Banco abastecido com todos os pontos do CSV!');
};
