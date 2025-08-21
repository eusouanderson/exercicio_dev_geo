import { getPoints } from '@/services/points_service';
import { describe, expect, it } from 'bun:test';

// feature usados no teste
interface Feature {
  properties: {
    censo_2022_domicilio_particular_poi_counts: number;
    [key: string]: any;
  };
}
//garante que o serviço retorna um objeto com "features"
//e que a quantidade de pontos não ultrapassa o limite passado (10)
describe('Points Service', () => {
  it('should paginate results correctly', async () => {
    const result = await getPoints(1, 10, 0);

    expect(result).toHaveProperty('features');
    expect(result.features.length).toBeLessThanOrEqual(10);
  });

  // garante que todos os pontos retornados respeitam o filtro minCount,
  // que a propriedade "censo_2022_domicilio_particular_poi_counts" é >= 5
  it('should filter results by minCount', async () => {
    const result = await getPoints(1, 100, 5);

    const allAboveMin = result.features.every(
      (f: Feature) => f.properties.censo_2022_domicilio_particular_poi_counts >= 5
    );

    expect(allAboveMin).toBe(true);
  });
});
