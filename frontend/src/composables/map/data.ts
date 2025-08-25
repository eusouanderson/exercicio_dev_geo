import { formatDisplayName } from "@/composables/map/config";
import { createCustomMarker } from "@/helpers/marker";
import * as geoService from "@/services/geoService";
import { getPoints } from "@/services/pointsService";
import * as polygonService from "@/services/polygonService";
import type { GeoPoint } from "@/types/geo";
import * as L from "leaflet";

/**
 * busca os pontos de análise e os adiciona ao mapa.
 */

export async function fetchAllPoints(
  allPointsData: { value: any[] },
  map: L.Map,
  updatePointsLayerFn: () => void,
  bounds?: L.LatLngBounds
) {
  try {
    const data = await getPoints(1, 1000);

    if (!data) return;

    let features: any[] = [];

    if (Array.isArray(data.apiPoints)) {
      features.push(...data.apiPoints);
    }

    if (Array.isArray(data.geoPoints)) {
      const geoFeatures = data.geoPoints.map((p: GeoPoint) => {
        const lat = parseFloat(p.lat);
        const lon = parseFloat(p.lon);

        return {
          type: "Feature",
          properties: {
            latitude: lat,
            longitude: lon,
            displayName: formatDisplayName(p.info),
            address: p.info.address || {},
          },
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
        };
      });
      features.push(...geoFeatures);
    }

    if (bounds) {
      features = features.filter((f) =>
        bounds.contains([f.geometry.coordinates[1], f.geometry.coordinates[0]])
      );
    }

    allPointsData.value = features;
    updatePointsLayerFn();
  } catch (err) {
    console.error("Erro ao carregar pontos de análise:", err);
  }
}

/**
 * carrega os pins salvos pelo usuário, usando a mesma formatação de nome.
 */
export const loadPersistedPoints = async (customLayer: L.LayerGroup) => {
  try {
    const persistedPoints = await geoService.listGeoPoints();

    if (persistedPoints && Array.isArray(persistedPoints)) {
      persistedPoints.forEach((point: GeoPoint) => {
        const lat = parseFloat(point.lat);
        const lon = parseFloat(point.lon);
        // CORREÇÃO: Usando a mesma função para garantir consistência
        const displayName = formatDisplayName(point.info);
        const marker = createCustomMarker(lat, lon, displayName);
        marker.addTo(customLayer);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar pontos persistidos:", error);
  }
};

/**
 * carrega os polígonos salvos.
 */
export async function loadSavedPolygons(
  savedPolygonsLayer: L.FeatureGroup,
  bounds?: L.LatLngBounds
) {
  try {
    const polygons = await polygonService.listPolygons();
    if (polygons && Array.isArray(polygons)) {
      polygons.forEach((polygon: any) => {
        const latlngs: L.LatLngTuple[] = JSON.parse(polygon.coordinates).map(
          (coord: number[]) => [coord[0], coord[1]] as L.LatLngTuple
        );

        const layer = L.polygon(latlngs, { color: "#3388ff" }).bindPopup(
          `<b>${polygon.name}</b><br>Contém ${
            polygon.pointsInside?.length || "N/A"
          } pontos.`
        );

        if (!bounds || bounds.intersects(layer.getBounds())) {
          savedPolygonsLayer.addLayer(layer);
        }
      });
    }
  } catch (error) {
    console.error("Erro ao carregar polígonos salvos:", error);
  }
}
