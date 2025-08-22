import type { AnalysisResult, DataFilter, SearchResult } from "@/types/map";
import type * as L from "leaflet";
import { ref } from "vue";

/**
 * cria e retorna todo o estado reativo para o mapa
 */

export function createMapState() {
  const allPointsData = ref<any[]>([]);
  const analysisResult = ref<AnalysisResult | null>(null);
  const interactionMode = ref<"navigate" | "draw">("navigate");
  const filter = ref<DataFilter>({ min_value: null });
  const mapType = ref<"roadmap" | "satellite">("roadmap");
  const showPoints = ref(true);
  const searchResults = ref<SearchResult[]>([]);
  const isLoading = ref(false);
  const searchError = ref<string | null>(null);
  const map = ref<L.Map | null>(null);
  const isMapInitialized = ref(false);

  return {
    allPointsData,
    analysisResult,
    interactionMode,
    filter,
    mapType,
    showPoints,
    searchResults,
    isLoading,
    searchError,
    map,
    isMapInitialized,
  };
}
