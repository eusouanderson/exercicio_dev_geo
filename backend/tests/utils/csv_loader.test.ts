import { clearCache, loadPointsData } from '@/utils/csv_loader';
import { beforeEach, describe, expect, it } from 'bun:test';
import path from 'path';

const validCsvPath = path.resolve(__dirname, '../fixtures/valid.csv');
const invalidCsvPath = path.resolve(__dirname, '../fixtures/invalid.csv');
const missingCsvPath = path.resolve(__dirname, '../fixtures/missing.csv');

describe('CSV Loader', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should return a FeatureCollection object for valid CSV', async () => {
    const data = await loadPointsData(validCsvPath);
    expect(data).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(data.features)).toBe(true);
  });

  it('should return empty FeatureCollection for missing file', async () => {
    const data = await loadPointsData(missingCsvPath);
    expect(data).toHaveProperty('type', 'FeatureCollection');
    expect(data.features.length).toBe(0);
  });

  it('should return empty FeatureCollection for CSV with parsing errors', async () => {
    const data = await loadPointsData(invalidCsvPath);
    expect(data).toHaveProperty('type', 'FeatureCollection');
    expect(data.features.length).toBe(0);
  });

  it('should parse valid CSV and include correct coordinates', async () => {
    const data = await loadPointsData(validCsvPath);
    expect(data.features.length).toBeGreaterThan(0);
    const feature = data.features[0];
    expect(feature).toHaveProperty('geometry');
    expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
    expect(feature.geometry.coordinates.length).toBe(2);
  });
});
