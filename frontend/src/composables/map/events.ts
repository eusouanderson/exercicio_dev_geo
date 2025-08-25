import {
  analyzePolygon,
  createAnalysisPrompt,
} from "@/composables/map/analysis";
import { createPopupContentHtml } from "@/composables/map/config";
import type { MapLayers } from "@/composables/map/layers";
import { createCustomMarker } from "@/helpers/marker";
import { sendGeminiPrompt } from "@/services/geminiService";
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
    isLoading: Ref<boolean>;
  };
}

// Variável para controlar o loading overlay
let loadingMarker: L.Marker | null = null;

/**
 * Função para mostrar loading overlay
 */
function showLoadingOverlay(
  map: L.Map,
  message: string = "Analisando dados..."
) {
  if (loadingMarker) {
    map.removeLayer(loadingMarker);
  }

  const loadingIcon = L.divIcon({
    html: `
      <div style="
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <div style="
          display: inline-block;
          width: 2rem;
          height: 2rem;
          border: 0.25em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          margin-bottom: 10px;
        "></div>
        <div style="margin-top: 10px; font-size: 14px;">${message}</div>
      </div>
    `,
    className: "loading-overlay",
    iconSize: [0, 0], // Tamanho zero
    iconAnchor: [0, 0],
  });

  loadingMarker = L.marker(map.getCenter(), {
    icon: loadingIcon,
    interactive: false,
    zIndexOffset: 1000,
  }).addTo(map);
}

/**
 * Função para esconder loading overlay
 */
function hideLoadingOverlay(map: L.Map) {
  if (loadingMarker) {
    map.removeLayer(loadingMarker);
    loadingMarker = null;
  }
}

/**
 * Configurando todos os event listeners para o mapa.
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

  // Evento de criação de polígono
  map.on(L.Draw.Event.CREATED, async (event) => {
    const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
    layers.drawnItems.addLayer(layer);

    const geojson = layer.toGeoJSON() as Feature<Polygon>;

    // Mostrar loading para análise inicial
    showLoadingOverlay(map, "Analisando polígono...");
    state.isLoading.value = true;

    let pointsInside: any[] = [];
    let analysis: AnalysisResult = {
      totalPoints: 0,
      sum: 0,
      mean: 0,
      median: 0,
      values: [],
    };
    let additionalData: any = {};

    try {
      const result = await analyzePolygon(geojson);
      pointsInside = result.pointsInside;
      analysis = result.analysis;
      additionalData = result.additionalData;

      console.log("📊 Resultado da análise:", analysis);
      console.log("📍 Pontos dentro do polígono:", pointsInside);
      console.log("📈 Dados adicionais:", additionalData);
    } catch (err) {
      console.error("Erro na análise do polígono:", err);
      hideLoadingOverlay(map);
      state.isLoading.value = false;
      alert("Erro ao analisar o polígono. Tente novamente.");
      return;
    }

    // Atualiza resultado de análise numérica
    state.analysisResult.value = analysis;

    // Atualizar loading para análise da IA
    showLoadingOverlay(map, "Gerando análise com IA...");

    // Chama IA para gerar análise textual com dados enriquecidos
    let aiResult = "";
    try {
      const promptText = createAnalysisPrompt(analysis, additionalData);
      const response = await sendGeminiPrompt(promptText);
      aiResult = response.result ?? "Análise não disponível no momento.";
    } catch (err) {
      console.error("Erro ao gerar análise da IA:", err);
      aiResult = "Erro ao gerar análise. Tente novamente.";
    }

    // Esconder loading após análise da IA
    hideLoadingOverlay(map);
    state.isLoading.value = false;

    // Exibe popup com análise numérica + IA
    layer
      .bindPopup(
        `<h4>Análise da Área</h4>
         <strong>Total de Pontos:</strong> ${analysis.totalPoints}<br>
         <strong>Soma:</strong> ${analysis.sum}<br>
         <strong>Média:</strong> ${analysis.mean.toFixed(2)}<br>
         <strong>Mediana:</strong> ${analysis.median}<br>
         ${
           additionalData.establishmentStats
             ? `
         <strong>Estabelecimentos:</strong> ${
           additionalData.establishmentStats.total
         }<br>
         <strong>Domicílios:</strong> ${
           additionalData.dwellingStats?.total || 0
         }<br>
         `
             : ""
         }
         <hr>
         <strong>Análise IA:</strong> <p style="max-height: 200px; overflow-y: auto;">${aiResult}</p>`
      )
      .openPopup();

    // Solicitar nome para o polígono
    const name = prompt(
      "Digite um nome para este polígono:",
      "Nova Área de Análise"
    );

    if (name) {
      // Mostrar loading para salvar polígono
      showLoadingOverlay(map, "Salvando análise...");
      state.isLoading.value = true;

      try {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const coordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);

        // Criar objeto com apenas as propriedades que o serviço espera
        const polygonData: any = {
          name,
          coordinates,
          pointsInside,
          aiResult,
        };

        // Adicionar propriedades extras apenas se o serviço suportar
        // Verifique a documentação do createPolygon para ver quais propriedades são aceitas
        const savedPolygon = await polygonService.createPolygon(polygonData);

        // Usar type assertion para evitar erro de tipo
        const newAnalysis = {
          id: savedPolygon.id,
          name: savedPolygon.name,
          totalPoints: analysis.totalPoints,
          sum: analysis.sum,
          mean: analysis.mean,
          median: analysis.median,
          values: pointsInside,
          aiResult: aiResult,
        } as PersistedAnalysis;

        state.analysisResults.value = [
          ...state.analysisResults.value,
          newAnalysis,
        ];

        // Armazenar dados adicionais separadamente
        if (savedPolygon.id) {
          localStorage.setItem(
            `analysis_${savedPolygon.id}_additional`,
            JSON.stringify({
              additionalData,
              analysisData: analysis,
            })
          );
        }

        // Redesenha polígonos salvos
        layers.savedPolygonsLayer.clearLayers();
        const listAnalysis: SavedPolygon[] =
          await polygonService.listPolygons();
        listAnalysis.forEach((poly) => {
          const coords: [number, number][] = poly.coordinates as [
            number,
            number
          ][];

          // Tentar recuperar dados adicionais do localStorage
          let storedAdditionalData = null;
          try {
            const stored = localStorage.getItem(
              `analysis_${poly.id}_additional`
            );
            storedAdditionalData = stored ? JSON.parse(stored) : null;
          } catch (e) {
            console.warn("Erro ao recuperar dados adicionais:", e);
          }

          const popupContent = `
            <h4>${poly.name}</h4>
            <strong>Total de Pontos:</strong> ${poly.properties.totalPoints}<br>
            <strong>Soma:</strong> ${poly.properties.sum}<br>
            <strong>Média:</strong> ${poly.properties.average ?? 0}<br>
            <strong>Mediana:</strong> ${poly.properties.median ?? 0}<br>
            ${
              storedAdditionalData?.additionalData?.establishmentStats
                ? `
            <strong>Estabelecimentos:</strong> ${
              storedAdditionalData.additionalData.establishmentStats?.total || 0
            }<br>
            <strong>Domicílios:</strong> ${
              storedAdditionalData.additionalData.dwellingStats?.total || 0
            }<br>
            `
                : ""
            }
            <strong>Análise IA:</strong> <p style="max-height: 150px; overflow-y: auto;">${
              poly.properties.aiResult ?? ""
            }</p>
          `;

          const leafletPolygon = L.polygon(
            coords.map(([lat, lng]) => [lat, lng]),
            { color: "#3388ff" }
          ).bindPopup(popupContent);

          layers.savedPolygonsLayer.addLayer(leafletPolygon);
        });

        layers.drawnItems.clearLayers();
        state.analysisResult.value = null;
      } catch (error) {
        console.error("Falha ao salvar polígono:", error);
        alert("Erro ao salvar polígono.");
      } finally {
        hideLoadingOverlay(map);
        state.isLoading.value = false;
      }
    } else {
      // Usuário cancelou, limpar layers
      layers.drawnItems.clearLayers();
      state.analysisResult.value = null;
    }
  });

  map.on("draw:drawstart", () => {
    layers.drawnItems.clearLayers();
    state.analysisResult.value = null;
  });

  // Limpar loading overlay se o usuário sair da página
  map.on("unload", () => {
    hideLoadingOverlay(map);
    state.isLoading.value = false;
  });
}
