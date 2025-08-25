import { describe, expect, it, mock } from 'bun:test';

describe('Points Repository', () => {
  it('should return all points', async () => {
    const fakePoints = [
      { id: 1, lat: '-22.0', lon: '-47.0', info: { name: 'A' } },
      { id: 2, lat: '-23.0', lon: '-48.0', info: { name: 'B' } },
    ];

    mock.module('@/db/connect', () => ({
      db: {
        select: () => ({
          from: () => fakePoints,
        }),
      },
    }));

    const { findAllPoints } = await import('@/repository/points_repository');
    const result = await findAllPoints();

    expect(result).toEqual(fakePoints);
  });

  it('should create a new point', async () => {
    const newPoint = { lat: '-25.0', lon: '-50.0', info: { name: 'Novo' } };
    const inserted = { id: 99, ...newPoint };

    mock.module('@/db/connect', () => ({
      db: {
        insert: () => ({
          values: () => ({
            returning: () => [inserted],
          }),
        }),
      },
    }));

    const { createPoint } = await import('@/repository/points_repository');
    const result = await createPoint(newPoint as any);

    expect(result).toEqual(inserted);
  });
});
