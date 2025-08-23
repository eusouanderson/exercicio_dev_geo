import { analyzePolygon } from "@/composables/map/analysis";
import { formatDisplayName } from "@/composables/map/data";
import type { MapLayers } from "@/composables/map/layers";
import { createCustomMarker } from "@/helpers/marker";
import * as geoService from "@/services/geoService";
import * as polygonService from "@/services/polygonService";
import type { Info } from "@/types/geo";
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

function createPopupContentHtml(info: Info): string {
  const title = formatDisplayName(info);

  const lat = parseFloat(info.lat || "0").toFixed(6);
  const lon = parseFloat(info.lon || "0").toFixed(6);
  const country = info.address?.country || "N/A";
  const state = info.address?.state || "N/A";
  const type = info.type || "N/A";

  return `
    <div style="font-family: sans-serif; font-size: 14px; max-width: 280px;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">${title}</h3>
      <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;">
      <p style="margin: 5px 0;"><strong>País:</strong> ${country}</p>
      <p style="margin: 5px 0;"><strong>Estado:</strong> ${state}</p>
      <p style="margin: 5px 0;"><strong>Tipo:</strong> ${type}</p>
      <p style="margin: 5px 0; font-size: 12px; color: #555;">
        <strong>Coords:</strong> ${lat}, ${lon}
      </p>
    </div>
  `;
}

/**
 * configurando todos os event listeners para o mapa.
 */
export function setupMapEventListeners({ map, layers, state }: EventHandlers) {
  map.on("contextmenu", async (event: L.LeafletMouseEvent) => {
    if (state.interactionMode.value === "navigate") {
      const { lat, lng } = event.latlng;

      try {
        // 1. Salva o ponto no banco de dados
        // A resposta de createGeoPoint pode já conter os dados que você precisa
        const newPoint = await geoService.createGeoPoint({ lat, lon: lng });

        // 2. Se a criação não retornar os detalhes, busca com o reverseGeo.
        // Assumindo que a resposta de createGeoPoint já tem a estrutura completa,
        // podemos usar newPoint.info diretamente.
        const infoData =
          newPoint.info || (await geoService.reverseGeo(lat, lng));

        // 3. Gera o HTML do popup usando a nova função
        const popupContent = createPopupContentHtml(infoData);

        // 4. Cria e adiciona o marcador ao mapa
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
