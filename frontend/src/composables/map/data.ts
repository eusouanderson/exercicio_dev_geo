import { formatDisplayName } from "@/composables/map/config";
import { getPoints } from "@/services/pointsService";
import * as polygonService from "@/services/polygonService";
import type { GeoPoint } from "@/types/geo";
import type { PersistedAnalysis } from "@/types/map";
import * as L from "leaflet";
import type { Ref } from "vue";

/**
 * busca os pontos de análise e os adiciona ao mapa.
 */
export async function fetchAllPoints(
  allPointsData: Ref<any[]>,
  map: L.Map,
  updatePointsLayerFn: () => void,
  bounds?: L.LatLngBounds
) {
  try {
    const data = await getPoints(1, 500);
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
 * carrega os polígonos salvos e adiciona botão de apagar.
 */
export async function loadSavedPolygons(
  savedPolygonsLayer: L.FeatureGroup,
  state: { analysisResults: Ref<PersistedAnalysis[]> },
  bounds?: L.LatLngBounds
) {
  try {
    const polygons = await polygonService.listPolygons();
    if (!polygons || !Array.isArray(polygons)) return;

    polygons.forEach((polygon: any) => {
      const latlngs: L.LatLngTuple[] = JSON.parse(polygon.coordinates).map(
        (coord: number[]) => [coord[0], coord[1]] as L.LatLngTuple
      );

      // cria popup dinâmico
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `<b>Nome salvo: ${polygon.name}</b>
      `;

      // botão Apagar
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Apagar";
      deleteBtn.style.marginTop = "8px";
      deleteBtn.style.padding = "5px 12px";
      deleteBtn.style.backgroundColor = "#e74c3c";
      deleteBtn.style.color = "#fff";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "5px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.fontWeight = "bold";
      deleteBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
      deleteBtn.style.transition = "all 0.2s ease";
      deleteBtn.onclick = async () => {
        try {
          await polygonService.deletePolygon(polygon.id);
          savedPolygonsLayer.removeLayer(leafletPolygon);
          state.analysisResults.value = state.analysisResults.value.filter(
            (a) => a.id !== polygon.id
          );
          localStorage.removeItem(`analysis_${polygon.id}_additional`);
        } catch (err) {
          console.error("Erro ao deletar polígono:", err);
          alert("Falha ao deletar polígono.");
        }
      };
      popupContent.appendChild(deleteBtn);

      const leafletPolygon = L.polygon(latlngs, { color: "#3388ff" }).bindPopup(
        popupContent
      );

      if (!bounds || bounds.intersects(leafletPolygon.getBounds())) {
        savedPolygonsLayer.addLayer(leafletPolygon);
      }
    });
  } catch (error) {
    console.error("Erro ao carregar polígonos salvos:", error);
  }
}
