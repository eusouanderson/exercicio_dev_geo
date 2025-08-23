import { analyzePolygon } from "@/composables/map/analysis";
import { createPopupContentHtml } from "@/composables/map/config";
import type { MapLayers } from "@/composables/map/layers";
import { createCustomMarker } from "@/helpers/marker";
import * as geoService from "@/services/geoService";
import * as polygonService from "@/services/polygonService";
import type {
  AnalysisResult,
  PersistedAnalysis,
  SavedPolygon,
} from "@/types/map";
import type { Feature, Polygon } from "geojson";
import * as L from "leaflet";
import "leaflet-draw";
import type { Ref } from "vue";

export interface EventHandlers {
  map: L.Map;
  layers: MapLayers;
  state: {
    interactionMode: Ref<"navigate" | "draw">;
    allPointsData: Ref<any[]>;
    analysisResult: Ref<AnalysisResult | null>;
    analysisResults: Ref<PersistedAnalysis[]>;
  };
}

/**
 * configurando todos os event listeners para o mapa.
 * contextmenu
 */
export function setupMapEventListeners({ map, layers, state }: EventHandlers) {
  map.on("contextmenu", async (event: L.LeafletMouseEvent) => {
    if (state.interactionMode.value === "navigate") {
      const { lat, lng } = event.latlng;

      try {
        const newPoint = await geoService.createGeoPoint({ lat, lon: lng });
        const infoData =
          newPoint.info || (await geoService.reverseGeo(lat, lng));
        const popupContent = createPopupContentHtml(infoData);
        const marker = createCustomMarker(lat, lng, popupContent);
        layers.customLayer.addLayer(marker);
        marker.openPopup();
      } catch (err) {
        console.error("Erro ao adicionar novo pino:", err);
        const marker = createCustomMarker(
          lat,
          lng,
          "Erro ao salvar ou buscar informações."
        );
        layers.customLayer.addLayer(marker);
        marker.openPopup();
      }
    }
  });

  //evento de criação de polígono PRECISO COLOCAR A RESPOSTA DA ANALISE COM IA AQUI
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

        // 🔥 Busca todos os polígonos persistidos
        const listAnalysis: SavedPolygon[] =
          await polygonService.listPolygons();

        // Atualiza estado (para usar em uma lista lateral, tabela, etc.)
        state.analysisResults.value = listAnalysis.map((p) => ({
          id: p.id,
          name: p.name,
          totalPoints: p.properties.totalPoints,
          sum: p.properties.sum,
          mean: p.properties.average ?? 0,
          median: p.properties.median ?? 0,
        }));

        // Limpa camada de polígonos salvos e redesenha todos
        layers.savedPolygonsLayer.clearLayers();

        listAnalysis.forEach((poly) => {
          const coords: [number, number][] = JSON.parse(poly.coordinates);

          const leafletPolygon = L.polygon(
            coords.map(([lat, lng]) => [lat, lng]),
            {
              color: "#3388ff",
            }
          ).bindPopup(
            `<h4>${poly.name}</h4>
           <strong>Total de Pontos:</strong> ${poly.properties.totalPoints}<br>
           <strong>Soma:</strong> ${poly.properties.sum}<br>
           <strong>Média:</strong> ${poly.properties.average ?? 0}<br>
           <strong>Mediana:</strong> ${poly.properties.median ?? 0}`
          );

          layers.savedPolygonsLayer.addLayer(leafletPolygon);
        });

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
    //state.analysisResult.value = null;
  });
}
