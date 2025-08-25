export interface AnalysisResult {
  totalPoints: number;
  sum: number;
  mean: number;
  median: number;
  values: number[];
}

export interface PointData {
  id: string | number;
  lat: number;
  lng: number;
  value?: number;
  valor?: number;
  [key: string]: any;
}

export interface SavedPolygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  properties: {
    totalPoints: number;
    sum: number;
    average?: number;
    median?: number;
    aiResult?: string;
    createdAt: string;
  };
}

export interface DataFilter {
  min_value: number | null;
}

export interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  boundingbox: [string, string, string, string];
  type: string;
}

export interface PersistedAnalysis extends AnalysisResult {
  id: number;
  aiResult?: string;
  name: string;
  additionalData?: any;
}
