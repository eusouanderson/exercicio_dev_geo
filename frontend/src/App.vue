<template>
  <div id="map-container">
    <div id="map" style="height: 100vh; width: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import * as L from "leaflet";
import { fetchPoints } from "@/services/pointsService";

const lat = -23.55052;
const lon = -46.63331;

let map: L.Map;
let pointsLayer: L.LayerGroup;

onMounted(async () => {
  initializeMap();
  await loadPoints();
});

const initializeMap = () => {
  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Anderson &copy; OpenStreetMap contributors",
  }).addTo(map);

  pointsLayer = L.layerGroup().addTo(map);
};

const loadPoints = async () => {
  try {
    const data = await fetchPoints();
    pointsLayer.clearLayers();

    if (
      data.features &&
      Array.isArray(data.features) &&
      data.features.length > 0
    ) {
      const latlngs: L.LatLngExpression[] = [];

      data.features.forEach((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;

        const popupContent = Object.entries(feature.properties)
          .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
          .join("<br>");

        const marker = L.marker([lat, lng]).bindPopup(popupContent);

        marker.addTo(pointsLayer);
        latlngs.push([lat, lng]);
      });

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  } catch (err) {
    console.error("Erro ao carregar pontos:", err);
  }
};
</script>

<style scoped>
#map-container {
  height: 100vh;
  width: 100%;
}
</style>
