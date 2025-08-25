import { listPoints } from '@/controllers/points_controller';
import { describe, expect, it, mock } from 'bun:test';
import { Hono } from 'hono';

describe('Points Controller', () => {
  it('should return apiPoints and geoPoints with limit applied', async () => {
    // mock do service que respeita o limit
    mock.module('@/services/points_service', () => ({
      getPoints: async (_page: number, limit: number) => ({
        features: Array.from({ length: limit }, (_, i) => ({
          geometry: { coordinates: [-50 - i, -20 - i] },
          properties: { name: `Ponto ${i + 1}` },
        })),
      }),
    }));

    mock.module('@/repository/geo_repository', () => ({
      findAllGeoPoints: async () => [{ id: 1, lat: '-22.0', lon: '-47.0' }],
    }));

    mock.module('@/repository/points_repository', () => ({
      findAllPoints: async () => [],
      createPoint: async () => undefined,
    }));

    const app = new Hono();
    app.get('/points', listPoints);

    const res = await app.request('/points?page=1&limit=1');
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      apiPoints: any[];
      geoPoints: any[];
    };

    expect(data).toHaveProperty('apiPoints');
    expect(data).toHaveProperty('geoPoints');

    // limit aplicado
    expect(data.apiPoints.length).toBeLessThanOrEqual(1);

    // geoPoints mockados
    expect(data.geoPoints).toEqual([{ id: 1, lat: '-22.0', lon: '-47.0' }]);
  });

  it('should not create duplicate points if already exists', async () => {
    mock.module('@/services/points_service', () => ({
      getPoints: async () => ({
        features: [
          {
            geometry: { coordinates: [-50, -20] },
            properties: { name: 'Duplicado' },
          },
        ],
      }),
    }));

    mock.module('@/repository/geo_repository', () => ({
      findAllGeoPoints: async () => [],
    }));

    // contador para simular chamadas a createPoint
    let called = 0;
    const createPointMock = async () => {
      called++;
      return;
    };

    mock.module('@/repository/points_repository', () => ({
      findAllPoints: async () => [
        { lat: '-20', lon: '-50' }, // já existe
      ],
      createPoint: createPointMock,
    }));

    const app = new Hono();
    app.get('/points', listPoints);

    const res = await app.request('/points');
    expect(res.status).toBe(200);

    const data = (await res.json()) as { apiPoints: any[] };
    expect(data.apiPoints.length).toBe(1);

    expect(called).toBe(0);
  });
});
