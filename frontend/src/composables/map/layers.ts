import type { DataFilter } from "@/types/map";
import * as L from "leaflet";
import type { Ref } from "vue";

// tipagem para as variáveis de layers

export interface MapLayers {
  pointsLayer: L.MarkerClusterGroup;
  customLayer: L.LayerGroup;
  savedPolygonsLayer: L.FeatureGroup;
  drawnItems: L.FeatureGroup;
  tileLayer: L.TileLayer;
}

/**
 * inicializa todos os layers do mapa
 */
export function initializeLayers(map: L.Map): MapLayers {
  const drawnItems = new L.FeatureGroup().addTo(map);
  const layers: MapLayers = {
    pointsLayer: L.markerClusterGroup(),
    customLayer: L.layerGroup().addTo(map),
    savedPolygonsLayer: new L.FeatureGroup().addTo(map),
    drawnItems: drawnItems,
    tileLayer: L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ["a", "b", "c"],
      }
    ).addTo(map),
  };

  const overlayLayers = {
    "Meus Pins": layers.customLayer,
    "Pontos de Análise": layers.pointsLayer,
    "Áreas Salvas": layers.savedPolygonsLayer,
  };
  L.control
    .layers(undefined, overlayLayers, { position: "topright" })
    .addTo(map);
  map.addLayer(layers.pointsLayer);

  return layers;
}

/**
 * atualiza o layer de pontos com base nos filtros e dados atuais.
 */
export function updatePointsLayer(
  pointsLayer: L.MarkerClusterGroup,
  allPointsData: Ref<any[]>,
  filter: Ref<DataFilter>
) {
  pointsLayer.clearLayers();
  const filteredData = allPointsData.value.filter((feature) => {
    const properties = feature.properties || {};
    if (
      filter.value.min_value !== null &&
      properties.value < filter.value.min_value
    ) {
      return false;
    }
    return true;
  });

  const markers = filteredData.map((feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const popupContent = Object.entries(feature.properties)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join("<br>");
    return L.marker([lat, lng]).bindPopup(popupContent);
  });
  pointsLayer.addLayers(markers);
}
