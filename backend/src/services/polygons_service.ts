import { polygonsRepository } from '@/repository/polygons_repository';

export const polygonsService = {
  createPolygon: async (data: { name: string; coordinates: any; pointsInside?: number[] }) => {
    const metrics = data.pointsInside ? calculateMetrics(data.pointsInside) : {};

    return polygonsRepository.create({
      ...data,
      properties: metrics,
    });
  },
};

const calculateMetrics = (values: number[]) => {
  const totalPoints = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const average = sum / totalPoints;
  const sorted = [...values].sort((a, b) => a - b);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return { totalPoints, sum, average, median };
};
