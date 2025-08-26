import { createPoint, findPointByCoords } from '@/repository/points_repository';
import { loadPointsData } from '@/utils/csv_loader';

export const populatePoints = async () => {
  const pointsData = await loadPointsData();
  const totalPoints = pointsData.features.length;
  let populatedCount = 0;

  console.log(`Total de pontos no CSV: ${totalPoints}`);

  for (const feature of pointsData.features) {
    const lat = String(Number(feature.geometry.coordinates[1]).toFixed(6));
    const lon = String(Number(feature.geometry.coordinates[0]).toFixed(6));

    const existing = await findPointByCoords(lat, lon);
    if (!existing) {
      await createPoint({
        lat,
        lon,
        info: feature.properties,
      });
      populatedCount++;
    }

    console.log(
      `Populados até agora: ${populatedCount} / ${totalPoints} (${(
        (populatedCount / totalPoints) *
        100
      ).toFixed(1)}%)`
    );
  }

  console.log('Banco abastecido com todos os pontos do CSV!');
};
