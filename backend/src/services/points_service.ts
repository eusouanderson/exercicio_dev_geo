import { loadPointsData } from '@/utils/csv_loader';

export const getPoints = async (page: number, limit: number, minCount: number) => {
  const pointsData = await loadPointsData();

  let filtered = pointsData.features.filter(
    (f: any) => f.properties.censo_2022_domicilio_particular_poi_counts >= minCount
  );

  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = filtered.slice(start, end);

  return {
    type: 'FeatureCollection',
    features: paged,
    total: filtered.length,
    page,
    limit,
  };
};
