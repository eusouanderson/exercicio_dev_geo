import { ref } from "vue";

export interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
  boundingbox: [string, string, string, string];
  type: string;
}

export const useGeocodingService = () => {
  const searchResults = ref<SearchResult[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Erro na busca");
      }

      const data = await response.json();
      searchResults.value = data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        boundingbox: item.boundingbox,
        type: item.type,
      }));
    } catch (err) {
      error.value = "Erro ao buscar localização";
      console.error("Erro na geocodificação:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearResults = () => {
    searchResults.value = [];
    error.value = null;
  };

  return {
    searchResults,
    isLoading,
    error,
    searchLocation,
    clearResults,
  };
};
