import { getPoints } from "@/services/pointsService";
import * as polygonService from "@/services/polygonService";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import { ref } from "vue";

// ADICIONADO: Import do serviço para carregar e salvar pinos persistidos.
import * as geoService from "@/services/geoService";

// ADICIONADO: Correção para o ícone padrão do Leaflet, uma boa prática para evitar bugs visuais.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface AnalysisResult {
  totalPoints: number;
  sum: number;
  mean: number;
  median: number;
}

export function useMap(mapContainerId: string) {
  // --- STATE ---
  const showPoints = ref(true);
  const allPointsData = ref<any[]>([]);
  const analysisResult = ref<AnalysisResult | null>(null);
  const interactionMode = ref<"navigate" | "draw">("navigate");

  let map: L.Map;
  let pointsLayer: L.LayerGroup; // Camada para pontos de análise (GeoJSON)
  let customLayer: L.LayerGroup; // ADICIONADO: Camada para pinos persistidos (do geoService)
  let drawnItems: L.FeatureGroup;
  let drawControl: L.Control.Draw; // ADICIONADO: Referência ao controle de desenho

  // --- MÉTODOS ---

  // ALTERADO: Versão aprimorada que desativa o arrastar do mapa e as ferramentas de desenho.
  const setInteractionMode = (mode: "navigate" | "draw") => {
    interactionMode.value = mode;
    if (map) {
      if (mode === "draw") {
        map.dragging.disable();
      } else {
        map.dragging.enable();
        // Garante que as ferramentas de desenho sejam desativadas ao sair do modo
        if (drawControl) {
          (drawControl as any)._toolbars.draw.disable();
          (drawControl as any)._toolbars.edit.disable();
        }
      }
    }
  };

  // Esta função carrega os pontos para ANÁLISE (GeoJSON)
  const loadPoints = async ({ page = 1, limit = 1000 } = {}) => {
    try {
      const data = await getPoints(page, limit);
      pointsLayer.clearLayers();
      allPointsData.value = [];

      if (data.features && data.features.length) {
        allPointsData.value = data.features;
        const latlngs: L.LatLngExpression[] = [];
        allPointsData.value.forEach((feature: any) => {
          const [lng, lat] = feature.geometry.coordinates;
          const popupContent = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join("<br>");
          L.marker([lat, lng]).bindPopup(popupContent).addTo(pointsLayer);
          latlngs.push([lat, lng]);
        });
        if (latlngs.length) {
          map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar pontos de análise:", err);
    }
  };

  // ADICIONADO: Função para carregar os pinos que já estão salvos no banco de dados.
  const loadPersistedPoints = async () => {
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
  };

  const analyzePolygon = (polygonLayer: L.Polygon) => {
    const polygonGeoJSON = polygonLayer.toGeoJSON();
    const pointsGeoJSON = turf.featureCollection(
      allPointsData.value.map((p) =>
        turf.point(p.geometry.coordinates, p.properties)
      )
    );

    const ptsWithin = turf.pointsWithinPolygon(pointsGeoJSON, polygonGeoJSON);

    const values = ptsWithin.features
      .map((f) => f.properties.value)
      .filter((v) => typeof v === "number");

    if (!values.length) {
      analysisResult.value = { totalPoints: 0, sum: 0, mean: 0, median: 0 };
      return { pointsInside: [], analysis: analysisResult.value };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;

    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;

    analysisResult.value = {
      totalPoints: values.length,
      sum: parseFloat(sum.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
    };

    const pointIdsInside = ptsWithin.features.map((f) => f.properties.id);
    return { pointsInside: pointIdsInside, analysis: analysisResult.value };
  };

  const initializeMap = () => {
    map = L.map(mapContainerId).setView([-23.55052, -46.63331], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "Map &copy; OpenStreetMap contributors",
    }).addTo(map);

    pointsLayer = L.layerGroup().addTo(map);
    customLayer = L.layerGroup().addTo(map); // ADICIONADO
    drawnItems = new L.FeatureGroup().addTo(map);

    // ALTERADO: Atribuído à variável `drawControl` para referência futura.
    drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: {
          shapeOptions: { color: "#f06eaa" },
          allowIntersection: false,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    // ADICIONADO: Lógica de clique para salvar e adicionar novos pinos via geoService.
    map.on("click", async (event: L.LeafletMouseEvent) => {
      if (interactionMode.value === "navigate") {
        const { lat, lng } = event.latlng;
        try {
          // 1. Salva o ponto no backend
          await geoService.createGeoPoint({ lat, lon: lng });

          // 2. Busca os dados de endereço para o popup
          const geoData = await geoService.reverseGeo(lat, lng);
          const popupContent = geoData.display_name || JSON.stringify(geoData);

          // 3. Adiciona o marcador no mapa
          L.marker([lat, lng])
            .bindPopup(popupContent)
            .addTo(customLayer)
            .openPopup();
        } catch (err) {
          console.error("Erro ao adicionar novo pino:", err);
          L.marker([lat, lng])
            .bindPopup("Erro ao salvar ou buscar informações do pino.")
            .addTo(customLayer)
            .openPopup();
        }
      }
    });

    map.on(L.Draw.Event.CREATED, async (event) => {
      const layer = (event as any).layer as L.Polygon;
      drawnItems.addLayer(layer);

      const { pointsInside, analysis } = analyzePolygon(layer);

      layer
        .bindPopup(
          `
          <h4>Análise da Área</h4>
          <strong>Total de Pontos:</strong> ${analysis.totalPoints}<br>
          <strong>Soma:</strong> ${analysis.sum}<br>
          <strong>Média:</strong> ${analysis.mean}<br>
          <strong>Mediana:</strong> ${analysis.median}
        `
        )
        .openPopup();

      const name = prompt(
        "Digite um nome para este polígono:",
        "Nova Área de Análise"
      );
      if (name) {
        try {
          const latlngs = layer.getLatLngs() as L.LatLng[][];
          const coordinates: number[][] = latlngs[0].map((latlng) => [
            latlng.lat,
            latlng.lng,
          ]);

          await polygonService.createPolygon({
            name,
            coordinates,
            pointsInside,
          });
          alert("Polígono salvo com sucesso!");
        } catch (error) {
          console.error("Falha ao salvar polígono:", error);
          alert("Erro ao salvar polígono.");
        }
      }
    });

    map.on("draw:drawstart", () => {
      analysisResult.value = null;
    });
  };

  const togglePoints = () => {
    showPoints.value = !showPoints.value;
    if (map.hasLayer(pointsLayer)) map.removeLayer(pointsLayer);
    else map.addLayer(pointsLayer);
  };

  // ALTERADO: O init agora chama as duas funções de carregamento de pontos.
  const init = async () => {
    initializeMap();
    await loadPoints(); // Carrega pontos para análise
    await loadPersistedPoints(); // Carrega pinos salvos do banco de dados
  };

  return {
    showPoints,
    analysisResult,
    togglePoints,
    init,
    interactionMode,
    setInteractionMode,
  };
}
