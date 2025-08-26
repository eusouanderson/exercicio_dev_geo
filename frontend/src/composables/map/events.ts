import {
  analyzePolygon,
  createAnalysisPromptFromPoints,
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
    iconSize: [0, 0],
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
 * Função para criar conteúdo de popup melhorado
 */
function createEnhancedPopupContent(
  analysis: AnalysisResult,
  aiResult: string,
  additionalData: any,
  isTemporary: boolean = true
): string {
  return `
    <div class="analysis-popup">
      <h4>${isTemporary ? "Análise da Área" : "💾 Análise Salva"}</h4>

      <div class="stats-grid">
        <div class="stat-item">
          <strong>📍 Total de Pontos:</strong> ${analysis.totalPoints}
        </div>
        ${
          analysis.sum
            ? `<div class="stat-item"><strong>∑ Soma:</strong> ${analysis.sum.toFixed(
                2
              )}</div>`
            : ""
        }
        ${
          analysis.mean
            ? `<div class="stat-item"><strong>📈 Média:</strong> ${analysis.mean.toFixed(
                2
              )}</div>`
            : ""
        }
        ${
          analysis.median
            ? `<div class="stat-item"><strong>⚖️ Mediana:</strong> ${analysis.median.toFixed(
                2
              )}</div>`
            : ""
        }
      </div>

      ${
        additionalData.establishmentStats
          ? `
      <div class="additional-stats">

          ${
            additionalData.establishmentStats.byType
              ? Object.entries(additionalData.establishmentStats.byType)
                  .map(
                    ([type, count]) =>
                      `<div class="stat-item"><strong>${type}:</strong> ${count}</div>`
                  )
                  .join("")
              : ""
          }
        </div>
      </div>
      `
          : ""
      }

      <div class="ai-analysis">
        <h5>Análise IA</h5>
        <div class="ai-content">${aiResult}</div>
      </div>

      ${
        isTemporary
          ? `
      <div class="popup-actions">
        <button onclick="window.closeCurrentPolygonPopup()" class="btn-close">❌ Fechar</button>
      </div>
      `
          : ""
      }
    </div>
  `;
}

/**
 * Função para criar conteúdo de popup para polígonos salvos
 */
function createSavedPolygonPopupContent(
  poly: SavedPolygon,
  additionalData: any
): string {
  return `
    <div class="analysis-popup">
      <h4>${poly.name}</h4>

      <div class="stats-grid">
        <div class="stat-item"><strong>📍 Pontos:</strong> ${
          poly.properties.totalPoints
        }</div>
        ${
          poly.properties.sum
            ? `<div class="stat-item"><strong>∑ Soma:</strong> ${poly.properties.sum}</div>`
            : ""
        }
        ${
          poly.properties.average
            ? `<div class="stat-item"><strong>📈 Média:</strong> ${poly.properties.average}</div>`
            : ""
        }
        ${
          poly.properties.median
            ? `<div class="stat-item"><strong>⚖️ Mediana:</strong> ${poly.properties.median}</div>`
            : ""
        }
      </div>

      ${
        additionalData?.additionalData?.establishmentStats
          ? `
      <div class="additional-stats">
        <h5>🏢 Estabelecimentos</h5>
        <div class="stat-item"><strong>Total:</strong> ${
          additionalData.additionalData.establishmentStats.total || 0
        }</div>
      </div>
      `
          : ""
      }

      ${
        additionalData?.additionalData?.dwellingStats
          ? `
      <div class="additional-stats">
        <h5>🏠 Domicílios</h5>
        <div class="stat-item"><strong>Total:</strong> ${
          additionalData.additionalData.dwellingStats.total || 0
        }</div>
      </div>
      `
          : ""
      }

      <div class="ai-analysis">
        <h5> Análise IA</h5>
        <div class="ai-content">${poly.properties.aiResult || ""}</div>
      </div>
    </div>
  `;
}

/**
 * Função para adicionar estilos CSS aos popups
 */
function addPopupStyles() {
  if (document.getElementById("analysis-popup-styles")) return;

  const style = document.createElement("style");
  style.id = "analysis-popup-styles";
  style.textContent = `
    .analysis-popup {
      max-width: 400px;
      max-height: 500px;
      overflow-y: auto;
      font-family: Arial, sans-serif;
    }
    .analysis-popup h4 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 8px;
    }
    .analysis-popup h5 {
      margin: 15px 0 8px 0;
      color: #34495e;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 10px 0;
    }
    .stat-item {
      padding: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 12px;
      border-left: 3px solid #3498db;
    }
    .additional-stats {
      margin: 15px 0;
      padding: 12px;
      background: #e8f4f8;
      border-radius: 8px;
      border-left: 4px solid #2ecc71;
    }
    .ai-analysis {
      margin: 15px 0;
      padding: 12px;
      background: #f0f8f0;
      border-radius: 8px;
      border-left: 4px solid #27ae60;
    }
    .ai-content {
      max-height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.5;
      color: #2c3e50;
    }
    .popup-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: center;
    }
    .btn-save, .btn-close {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .btn-save {
      background: #27ae60;
      color: white;
    }
    .btn-save:hover {
      background: #219a52;
      transform: translateY(-1px);
    }
    .btn-close {
      background: #e74c3c;
      color: white;
    }
    .btn-close:hover {
      background: #c0392b;
      transform: translateY(-1px);
    }
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Função para atualizar polígonos salvos no mapa
 */
async function updateSavedPolygons(layers: MapLayers, map: L.Map) {
  layers.savedPolygonsLayer.clearLayers();
  const listAnalysis: SavedPolygon[] = await polygonService.listPolygons();

  listAnalysis.forEach((poly) => {
    const coords: [number, number][] = poly.coordinates as [number, number][];

    let storedAdditionalData = null;
    try {
      const stored = localStorage.getItem(`analysis_${poly.id}_additional`);
      storedAdditionalData = stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn("Erro ao recuperar dados adicionais:", e);
    }

    const popupContent = createSavedPolygonPopupContent(
      poly,
      storedAdditionalData
    );
    const leafletPolygon = L.polygon(
      coords.map(([lat, lng]) => [lat, lng]),
      {
        color: "#3388ff",
        fillOpacity: 0.3,
        weight: 2,
      }
    ).bindPopup(popupContent, { maxWidth: 450 });

    // Adicionar evento de clique para reabrir popup
    leafletPolygon.on("click", function (e: L.LeafletMouseEvent) {
      this.openPopup();
    });

    layers.savedPolygonsLayer.addLayer(leafletPolygon);
  });
}

/**
 * Configurando todos os event listeners para o mapa.
 */
export function setupMapEventListeners({ map, layers, state }: EventHandlers) {
  // Adicionar estilos CSS
  addPopupStyles();

  // Variáveis para controle do estado atual
  let currentPolygonLayer: L.Polygon | null = null;
  let currentAnalysis: AnalysisResult | null = null;
  let currentPointsInside: any[] = [];
  let currentAiResult: string = "";
  let currentAdditionalData: any = {};

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

  map.on(L.Draw.Event.CREATED, async (event) => {
    const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
    layers.drawnItems.addLayer(layer);
    currentPolygonLayer = layer;

    const geojson = layer.toGeoJSON() as Feature<Polygon>;

    showLoadingOverlay(map, "Analisando polígono...");
    state.isLoading.value = true;

    try {
      const result = await analyzePolygon(geojson);
      currentPointsInside = result.pointsInside;
      currentAnalysis = result.analysis;
      currentAdditionalData = result.additionalData;

      console.log("📊 Resultado da análise:", currentAnalysis);
      console.log("📍 Pontos dentro do polígono:", currentPointsInside);
      console.log("📈 Dados adicionais:", currentAdditionalData);
    } catch (err) {
      console.error("Erro na análise do polígono:", err);
      hideLoadingOverlay(map);
      state.isLoading.value = false;
      alert("Erro ao analisar o polígono. Tente novamente.");
      return;
    }

    state.analysisResult.value = currentAnalysis;

    showLoadingOverlay(map, "Gerando análise com IA...");

    try {
      const promptText = createAnalysisPromptFromPoints(currentPointsInside);
      const response = await sendGeminiPrompt(promptText);
      currentAiResult = response.result ?? "Análise não disponível no momento.";
    } catch (err) {
      console.error("Erro ao gerar análise da IA:", err);
      currentAiResult = "Erro ao gerar análise. Tente novamente.";
    }

    hideLoadingOverlay(map);
    state.isLoading.value = false;

    // Configurar funções globais para os botões
    (window as any).saveCurrentPolygonAnalysis = async () => {
      const name = prompt(
        `Digite um nome para esta análise (${currentAnalysis?.totalPoints} pontos):`,
        `Análise ${new Date().toLocaleDateString()}`
      );

      if (name && currentPolygonLayer && currentAnalysis) {
        showLoadingOverlay(map, "Salvando análise...");
        state.isLoading.value = true;

        try {
          const latlngs = currentPolygonLayer.getLatLngs()[0] as L.LatLng[];
          const coordinates = latlngs.map((latlng) => [latlng.lat, latlng.lng]);

          const polygonData: any = {
            name,
            coordinates,
            pointsInside: currentPointsInside,
            aiResult: currentAiResult,
            properties: {
              totalPoints: currentAnalysis.totalPoints,
              sum: currentAnalysis.sum,
              average: currentAnalysis.mean,
              median: currentAnalysis.median,
            },
          };

          const savedPolygon = await polygonService.createPolygon(polygonData);

          const newAnalysis: PersistedAnalysis = {
            id: savedPolygon.id,
            name: savedPolygon.name,
            totalPoints: currentAnalysis.totalPoints,
            sum: currentAnalysis.sum,
            mean: currentAnalysis.mean,
            median: currentAnalysis.median,
            values: currentPointsInside,
            aiResult: currentAiResult,
          };

          state.analysisResults.value = [
            ...state.analysisResults.value,
            newAnalysis,
          ];

          if (savedPolygon.id) {
            localStorage.setItem(
              `analysis_${savedPolygon.id}_additional`,
              JSON.stringify({
                additionalData: currentAdditionalData,
                analysisData: currentAnalysis,
              })
            );
          }

          await updateSavedPolygons(layers, map);

          layers.drawnItems.clearLayers();
          state.analysisResult.value = null;
          currentPolygonLayer = null;
        } catch (error) {
          console.error("Falha ao salvar polígono:", error);
          alert("Erro ao salvar a análise. Tente novamente.");
        } finally {
          hideLoadingOverlay(map);
          state.isLoading.value = false;
        }
      }
    };

    (window as any).closeCurrentPolygonPopup = () => {
      if (currentPolygonLayer) {
        currentPolygonLayer.closePopup();
        layers.drawnItems.removeLayer(currentPolygonLayer);
        currentPolygonLayer = null;
        state.analysisResult.value = null;
      }
    };

    // Configurar popup com conteúdo melhorado
    const popupContent = createEnhancedPopupContent(
      currentAnalysis,
      currentAiResult,
      currentAdditionalData,
      true
    );

    layer
      .bindPopup(popupContent, {
        maxWidth: 450,
        className: "enhanced-popup",
      })
      .openPopup();

    // Configurar eventos do popup
    layer.on("popupopen", () => {
      console.log("Popup aberto");
    });

    layer.on("popupclose", () => {
      console.log("Popup fechado");
    });

    // Permitir reabrir o popup ao clicar no polígono
    layer.on("click", (e: L.LeafletMouseEvent) => {
      if (!layer.isPopupOpen()) {
        layer.openPopup();
      }
    });

    // Prevenir que o popup seja fechado permanentemente
    map.on("popupclose", (e: L.PopupEvent) => {
      if (e.popup === layer.getPopup()) {
        // O popup foi fechado, mas o polígono permanece
        console.log("Popup fechado, polígono mantido");
      }
    });
  });

  map.on("draw:drawstart", () => {
    layers.drawnItems.clearLayers();
    state.analysisResult.value = null;
    currentPolygonLayer = null;
  });

  map.on("unload", () => {
    hideLoadingOverlay(map);
    state.isLoading.value = false;
    // Limpar funções globais
    delete (window as any).saveCurrentPolygonAnalysis;
    delete (window as any).closeCurrentPolygonPopup;
  });

  // Carregar polígonos salvos inicialmente
  updateSavedPolygons(layers, map);
}
