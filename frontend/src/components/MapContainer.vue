<template>
  <div id="map-container" class="relative h-screen w-full m-2">
    <div
      class="absolute top-4 left-1/2 -translate-x-1/2 z-[1010] backdrop-blur-sm bg-zinc-600 rounded-lg shadow-lg flex items-center gap-8"
    >
      <SearchBox @locationSelected="handleLocationSelected" />

      <InteractionMode
        :modelValue="interactionMode"
        @update="setInteractionMode"
      />
      <MapType :modelValue="mapType" @update="setMapType" />
      <PointsToggle :modelValue="showPoints" @toggle="togglePoints" />
      <ClearAnalysis :visible="!!analysisResult" @clear="clearAnalysis" />
    </div>

    <MapView />
  </div>

  <div class="w-full mt-4 flex flex-col items-center">
    <AnalysisBox :data="analysisResult ? [analysisResult] : []" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMap } from "@/composables/map/index";
import SearchBox from "@/components/Controls/SearchBox.vue";
import InteractionMode from "@/components/Controls/InteractionMode.vue";
import MapType from "@/components/Controls/MapType.vue";
import PointsToggle from "@/components/Controls/PointsToggle.vue";
import ClearAnalysis from "@/components/Controls/ClearAnalysis.vue";
import AnalysisBox from "@/components/AnalysisBox.vue";
import MapView from "@/components/MapView.vue";

const {
  showPoints,
  togglePoints,
  init,
  analysisResult,
  interactionMode,
  setInteractionMode,
  mapType,
  setMapType,
  clearAnalysis,
  map,
  flyToLocation,
} = useMap("map");

const handleLocationSelected = (result: any) => {
  if (map.value && flyToLocation) {
    flyToLocation(result.lat, result.lon);

    if (togglePoints) {
      togglePoints();
      togglePoints();
    }
  }
};

onMounted(() => {
  init();
});
</script>
