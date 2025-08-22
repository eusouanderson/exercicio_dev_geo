import * as L from "leaflet";
import { apiFetch } from "./api";
export const listGeoPoints = async () => {
  return apiFetch("/api/geo", {
    method: "GET",
  });
};

export const reverseGeo = async (lat: number, lon: number) => {
  return apiFetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`, {
    method: "GET",
  });
};

export const createGeoPoint = async (data: { lat: number; lon: number }) => {
  return apiFetch(`/api/geo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const loadPersistedPoints = async (customLayer: L.LayerGroup) => {
  try {
    const persistedPoints = await listGeoPoints();
    if (persistedPoints && Array.isArray(persistedPoints)) {
      persistedPoints.forEach((point: any) => {
        const lat = parseFloat(point.lat);
        const lon = parseFloat(point.lon);
        const popupContent =
          point.info?.display_name || `Lat: ${lat}, Lon: ${lon}`;
        L.marker([lat, lon]).bindPopup(popupContent).addTo(customLayer);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar pontos persistidos:", error);
  }
};
