import { analyzePolygon } from "@/composables/map/analysis";
import type { MapLayers } from "@/composables/map/layers";
import * as geoService from "@/services/geoService";
import * as polygonService from "@/services/polygonService";
import type { AnalysisResult } from "@/types/map";
import type { Feature, Polygon } from "geojson";
import * as L from "leaflet";
import "leaflet-draw";
import type { Ref } from "vue";

interface EventHandlers {
  map: L.Map;
  layers: MapLayers;
  state: {
    interactionMode: Ref<"navigate" | "draw">;
    allPointsData: Ref<any[]>;
    analysisResult: Ref<AnalysisResult | null>;
  };
}

/**
 * configurando todos os event listeners para o mapa.
 */
export function setupMapEventListeners({ map, layers, state }: EventHandlers) {
  map.on("click", async (event: L.LeafletMouseEvent) => {
    if (state.interactionMode.value === "navigate") {
      const { lat, lng } = event.latlng;
      try {
        await geoService.createGeoPoint({ lat, lon: lng });
        const geoData = await geoService.reverseGeo(lat, lng);
        const popupContent = geoData.display_name || `Lat: ${lat}, Lon: ${lng}`;
        L.marker([lat, lng])
          .bindPopup(popupContent)
          .addTo(layers.customLayer)
          .openPopup();
      } catch (err) {
        console.error("Erro ao adicionar novo pino:", err);
        L.marker([lat, lng])
          .bindPopup("Erro ao salvar ou buscar informações.")
          .addTo(layers.customLayer)
          .openPopup();
      }
    }
  });

  //evento de criação de polígono
  map.on(L.Draw.Event.CREATED, async (event) => {
    const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
    layers.drawnItems.addLayer(layer);

    const geojson = layer.toGeoJSON() as Feature<Polygon>;

    const { pointsInside, analysis } = analyzePolygon(
      geojson,
      state.allPointsData.value
    );
    state.analysisResult.value = analysis;

    layer
      .bindPopup(
        `<h4>Análise da Área</h4>
         <strong>Total de Pontos:</strong> ${analysis.totalPoints}<br>
         <strong>Soma:</strong> ${analysis.sum}<br>
         <strong>Média:</strong> ${analysis.mean}<br>
         <strong>Mediana:</strong> ${analysis.median}`
      )
      .openPopup();

    const name = prompt(
      "Digite um nome para este polígono:",
      "Nova Área de Análise"
    );
    if (name) {
      try {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const coordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);
        await polygonService.createPolygon({ name, coordinates, pointsInside });

        const newPolygon = L.polygon(layer.getLatLngs(), {
          color: "#3388ff",
        }).bindPopup(`<b>${name}</b>`);
        layers.savedPolygonsLayer.addLayer(newPolygon);
        layers.drawnItems.clearLayers();
        state.analysisResult.value = null;
      } catch (error) {
        console.error("Falha ao salvar polígono:", error);
        alert("Erro ao salvar polígono.");
      }
    }
  });

  map.on("draw:drawstart", () => {
    layers.drawnItems.clearLayers();
    state.analysisResult.value = null;
  });
}
