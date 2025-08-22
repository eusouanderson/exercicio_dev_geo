import type { SearchResult } from "@/types/map";
import * as L from "leaflet";
import type { Ref } from "vue";

let searchMarker: L.Marker | null = null;

/**
 * Busca por uma localização usando a API do Nominatim.
 */
export async function searchLocation(
  query: string,
  searchResults: Ref<SearchResult[]>,
  isLoading: Ref<boolean>,
  searchError: Ref<string | null>
) {
  if (!query.trim()) {
    searchResults.value = [];
    return;
  }
  isLoading.value = true;
  searchError.value = null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=10&addressdetails=1`
    );
    if (!response.ok) throw new Error("Erro na busca");
    const data = await response.json();
    searchResults.value = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (err) {
    searchError.value = "Erro ao buscar localização";
    console.error("Erro na geocodificação:", err);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navega o mapa até uma coordenada específica.
 */
export function flyToLocation(
  map: L.Map,
  lat: number,
  lng: number,
  zoom: number = 14
) {
  if (searchMarker && map.hasLayer(searchMarker)) {
    map.removeLayer(searchMarker);
  }
  searchMarker = L.marker([lat, lng]).addTo(map);
  searchMarker
    .bindPopup(
      `<b>Local encontrado:</b><br>${lat.toFixed(6)}, ${lng.toFixed(6)}`
    )
    .openPopup();
  map.flyTo([lat, lng], zoom, { duration: 1.5 });
}
