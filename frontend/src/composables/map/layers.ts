import type { DataFilter } from "@/types/map";
import * as L from "leaflet";
import type { Ref } from "vue";

// Tipagem para as variáveis de layers
export interface MapLayers {
  pointsLayer: L.MarkerClusterGroup;
  customLayer: L.LayerGroup;
  savedPolygonsLayer: L.FeatureGroup;
  drawnItems: L.FeatureGroup;
  tileLayer: L.TileLayer;
}

/**
 * Inicializa todos os layers do mapa
 */
export function initializeLayers(map: L.Map): MapLayers {
  if (!map) {
    throw new Error("Mapa não está inicializado.");
  }

  const drawnItems = new L.FeatureGroup().addTo(map);

  const layers: MapLayers = {
    pointsLayer: L.markerClusterGroup(),
    customLayer: L.layerGroup().addTo(map),
    savedPolygonsLayer: new L.FeatureGroup().addTo(map),
    drawnItems,
    tileLayer: L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
      }
    ).addTo(map),
  };

  // Overlay layers no controle
  const overlayLayers = {
    "Meus Pins": layers.customLayer,
    "Pontos de Análise": layers.pointsLayer,
    "Áreas Salvas": layers.savedPolygonsLayer,
  };

  L.control
    .layers(undefined, overlayLayers, { position: "topright" })
    .addTo(map);

  // Garantir que o cluster layer seja adicionado ao mapa
  if (!map.hasLayer(layers.pointsLayer)) {
    map.addLayer(layers.pointsLayer);
  }

  return layers;
}

/**
 * Atualiza o layer de pontos com base nos filtros e dados atuais.
 */
export function updatePointsLayer(
  pointsLayer: L.MarkerClusterGroup,
  allPointsData: Ref<any[]>,
  filter: Ref<DataFilter>
) {
  if (!pointsLayer) return;

  pointsLayer.clearLayers();

  const filteredData = allPointsData.value.filter((feature) => {
    const properties = feature?.properties || {};
    if (
      filter.value.min_value !== null &&
      typeof properties.value === "number" &&
      properties.value < filter.value.min_value
    ) {
      return false;
    }
    return true;
  });

  const markers = filteredData.map((feature: any) => {
    const [lng, lat] = feature.geometry?.coordinates || [0, 0];
    const props = feature?.properties || {};

    const popupContent = Object.entries(props)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join("<br>");

    return L.marker([lat, lng]).bindPopup(popupContent);
  });

  if (markers.length > 0) {
    pointsLayer.addLayers(markers);
  }
}
