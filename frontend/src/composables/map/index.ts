import * as L from "leaflet";

import "leaflet-draw";
import "leaflet.markercluster";

import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";
import { onUnmounted, watch } from "vue";

import type { SearchResult } from "@/types/map";
import { setupLeafletIcons } from "./config";
import { fetchAllPoints, loadPersistedPoints, loadSavedPolygons } from "./data";
import { setupMapEventListeners } from "./events";
import { initializeLayers, updatePointsLayer, type MapLayers } from "./layers";
import { flyToLocation, searchLocation } from "./search";
import { createMapState } from "./state";

setupLeafletIcons();

export function useMap(mapContainerId: string) {
  const state = createMapState();
  let layers: MapLayers;
  let drawControl: L.Control.Draw;

  const initializeMap = () => {
    const container = document.getElementById(mapContainerId);
    if (!container) {
      console.error(`Container com ID ${mapContainerId} não encontrado`);
      return;
    }
    if (state.map.value) state.map.value.remove();

    const leafletMap = L.map(mapContainerId, {
      minZoom: 4,
      maxZoom: 18,
    }).setView([-23.55052, -46.63331], 5);
    state.map.value = leafletMap;

    layers = initializeLayers(leafletMap as L.Map);

    drawControl = new L.Control.Draw({
      edit: { featureGroup: layers.drawnItems },
      draw: {
        polygon: { shapeOptions: { color: "#f06eaa" } },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    leafletMap.addControl(drawControl);

    setupMapEventListeners({ map: leafletMap as L.Map, layers, state });
    state.isMapInitialized.value = true;
  };

  const localUpdatePointsLayer = () => {
    if (layers?.pointsLayer && state.isMapInitialized.value) {
      updatePointsLayer(layers.pointsLayer, state.allPointsData, state.filter);
    }
  };

  const setInteractionMode = (mode: "navigate" | "draw") => {
    state.interactionMode.value = mode;
    if (!state.map.value) return;
    mode === "draw"
      ? state.map.value.dragging.disable()
      : state.map.value.dragging.enable();
  };
  const togglePoints = () => {
    if (!state.map.value || !layers?.pointsLayer) return;
    if (state.map.value.hasLayer(layers.pointsLayer)) {
      state.map.value.removeLayer(layers.pointsLayer);
      state.showPoints.value = false;
    } else {
      state.map.value.addLayer(layers.pointsLayer);
      state.showPoints.value = true;
    }
  };

  const setMapType = (type: "roadmap" | "satellite") => {
    state.mapType.value = type;
    if (!layers?.tileLayer || !state.isMapInitialized.value) return;
    const urls = {
      roadmap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    };
    layers.tileLayer.setUrl(urls[type]);
    layers.tileLayer.redraw();
  };

  const clearAnalysis = () => {
    if (layers?.drawnItems) layers.drawnItems.clearLayers();
    state.analysisResult.value = null;
  };

  const handleLocationSelected = (result: SearchResult) => {
    if (state.map.value) {
      flyToLocation(state.map.value as L.Map, result.lat, result.lon);
      state.searchResults.value = [];
    }
  };

  const destroyMap = () => {
    if (state.map.value) {
      state.map.value.remove();
      state.map.value = null;
    }
    state.isMapInitialized.value = false;
  };

  const init = async () => {
    initializeMap();
    if (state.map.value && state.isMapInitialized.value) {
      await fetchAllPoints(
        state.allPointsData,
        state.map.value as L.Map,
        localUpdatePointsLayer
      );
      await loadPersistedPoints(layers.customLayer);
      await loadSavedPolygons(layers.savedPolygonsLayer);
    }
  };

  watch(state.filter, localUpdatePointsLayer, { deep: true });
  onUnmounted(destroyMap);

  return {
    ...state,
    init,
    destroyMap,
    setInteractionMode,
    setMapType,
    clearAnalysis,
    togglePoints,
    searchLocation: (query: string) =>
      searchLocation(
        query,
        state.searchResults,
        state.isLoading,
        state.searchError
      ),
    handleLocationSelected,
    flyToLocation: (lat: number, lng: number) =>
      state.map.value && flyToLocation(state.map.value as L.Map, lat, lng),
  };
}
