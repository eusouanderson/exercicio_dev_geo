export interface AnalysisResult {
  totalPoints: number;
  sum: number;
  mean: number;
  median: number;
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
  name: string;
}

export interface SavedPolygon {
  id: number;
  name: string;
  coordinates: string;
  properties: {
    totalPoints: number;
    sum: number;
    average: number | null;
    median: number | null;
  };
}
