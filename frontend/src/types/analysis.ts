export interface AnalysisData {
  totalPoints: number;
  sum: number;
  mean: number;
  median: number;
}

export type GeoPoint = {
  id: number;
  lat: string;
  lon: string;
  info?: Record<string, any>;
  value?: number;
  valor?: number;
  createdAt?: string;
  [key: string]: any;
};

export interface AdditionalData {
  censusData: Record<string, number>;
  establishmentStats: {
    total: number;
    construction: number;
    otherPurposes: number;
    [key: string]: number;
  };
  dwellingStats: {
    total: number;
    particular: number;
    [key: string]: number;
  };
  categorySummary: Record<string, number>;
  allProperties: Record<string, number>;
}
