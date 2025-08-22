import * as geoService from "@/services/geoService";
import { getPoints } from "@/services/pointsService";
import * as polygonService from "@/services/polygonService";
import * as L from "leaflet";

/**
 * busca os pontos de análise e os adiciona ao mapa.
 */
export async function fetchAllPoints(
  allPointsData: { value: any[] },
  map: L.Map,
  updatePointsLayerFn: () => void
) {
  try {
    const data = await getPoints(1, 1000);
    if (data?.features) {
      allPointsData.value = data.features;
      updatePointsLayerFn();

      const latlngs = allPointsData.value.map(
        (f: any) =>
          [
            f.geometry.coordinates[1],
            f.geometry.coordinates[0],
          ] as L.LatLngExpression
      );
      if (latlngs.length) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      }
    }
  } catch (err) {
    console.error("Erro ao carregar pontos de análise:", err);
  }
}

/**
 * carrega os pins salvos pelo usuario
 */
export async function loadPersistedPoints(customLayer: L.LayerGroup) {
  try {
    const persistedPoints = await geoService.listGeoPoints();
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
}

/**
 * carrega os polígonos salvos
 */
export async function loadSavedPolygons(savedPolygonsLayer: L.FeatureGroup) {
  try {
    const polygons = await polygonService.listPolygons();
    if (polygons && Array.isArray(polygons)) {
      polygons.forEach((polygon: any) => {
        const latlngs: L.LatLngTuple[] = JSON.parse(polygon.coordinates).map(
          (coord: number[]) => [coord[0], coord[1]] as L.LatLngTuple
        );
        const polygonLayer = L.polygon(latlngs, { color: "#3388ff" }).bindPopup(
          `<b>${polygon.name}</b><br>Contém ${
            polygon.pointsInside?.length || "N/A"
          } pontos.`
        );
        savedPolygonsLayer.addLayer(polygonLayer);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar polígonos salvos:", error);
  }
}
