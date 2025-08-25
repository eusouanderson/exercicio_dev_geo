import { describe, expect, it, mock } from 'bun:test';

describe('Geo Repository CRUD', () => {
  it('should return all geo points', async () => {
    const fakePoints = [
      { id: 1, lat: '-22.0', lon: '-47.0' },
      { id: 2, lat: '-23.0', lon: '-48.0' },
    ];

    // Mock antes de importar o repositório
    mock.module('@/db/connect', () => ({
      db: {
        query: {
          geoPoints: {
            findMany: async () => fakePoints,
          },
        },
      },
    }));

    const { findAllGeoPoints } = await import('@/repository/geo_repository');
    const result = await findAllGeoPoints();
    expect(result).toEqual(fakePoints);
  });

  it('should create a new geo point', async () => {
    const newPoint = { lat: '-25.0', lon: '-50.0' };
    const inserted = { id: 99, ...newPoint };

    mock.module('@/db/connect', () => ({
      db: {
        insert: () => ({
          values: () => ({
            returning: async () => [inserted],
          }),
        }),
      },
    }));

    const { createGeoPoint } = await import('@/repository/geo_repository');
    const result = await createGeoPoint(newPoint as any);
    expect(result).toEqual(inserted);
  });

  //Mais ou menos
  it('should return a geo point by id', async () => {
    const point = { id: 1, lat: '-22.0', lon: '-47.0' };

    mock.module('@/db/connect', () => ({
      db: {
        query: {
          geoPoints: {
            findMany: async (args: any) => {
              if (args?.where?.id === 1) return [point];
              return [];
            },
          },
        },
      },
    }));

    const { findGeoPointById } = await import('@/repository/geo_repository');
    const result = await findGeoPointById(1);
    expect(result).toEqual(point);
  });

  it('should update a geo point', async () => {
    const updated = { id: 1, lat: '-21.0', lon: '-46.0' };

    mock.module('@/db/connect', () => ({
      db: {
        update: () => ({
          set: () => ({
            where: () => ({
              returning: async () => [updated],
            }),
          }),
        }),
      },
    }));

    const { updateGeoPoint } = await import('@/repository/geo_repository');
    const result = await updateGeoPoint(1, { lat: '-21.0', lon: '-46.0' });
    expect(result).toEqual(updated);
  });

  it('should delete a geo point', async () => {
    mock.module('@/db/connect', () => ({
      db: {
        delete: () => ({
          where: () => ({
            returning: async () => [{ id: 1 }],
          }),
        }),
      },
    }));

    const { deleteGeoPoint } = await import('@/repository/geo_repository');
    const result = await deleteGeoPoint(1);
    expect(result).toBe(true);
  });
});
