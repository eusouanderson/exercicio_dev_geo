<template>
  <div id="map-container" class="relative h-screen w-full m-2">
    <div
      id="controls"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-[1010] bg-amber-600 backdrop-blur-sm p-2 rounded-lg shadow-lg flex items-center gap-4"
    >
      <div class="flex rounded-md overflow-hidden border border-gray-300">
        <button
          @click="setInteractionMode('navigate')"
          :class="
            interactionMode === 'navigate'
              ? 'bg-blue-600 text-white'
              : 'bg-amber-50 hover:bg-blue-100 text-gray-700'
          "
          class="px-3 py-1.5 border-r border-gray-300 flex items-center gap-2 transition-colors duration-200"
          title="Navegar e Adicionar Pinos"
        >
          <span class="material-icons text-sm">place</span>
          Navegar
        </button>
        <button
          @click="setInteractionMode('draw')"
          :class="
            interactionMode === 'draw'
              ? 'bg-blue-600 text-white'
              : 'bg-white hover:bg-blue-100 text-gray-700'
          "
          class="px-3 py-1.5 flex items-center gap-2 transition-colors duration-200"
          title="Desenhar Polígonos para Análise"
        >
          <span class="material-icons text-sm">draw</span>
          Desenhar
        </button>
      </div>

      <div class="flex rounded-md overflow-hidden border border-gray-300">
        <button
          @click="setMapType('roadmap')"
          :class="
            mapType === 'roadmap'
              ? 'bg-blue-600 text-white'
              : 'bg-white hover:bg-blue-100 text-gray-700'
          "
          class="px-3 py-1.5 border-r border-gray-300 transition-colors duration-200"
          title="Visualização de Ruas"
        >
          Mapa
        </button>
        <button
          @click="setMapType('satellite')"
          :class="
            mapType === 'satellite'
              ? 'bg-blue-600 text-white'
              : 'bg-white hover:bg-blue-100 text-gray-700'
          "
          class="px-3 py-1.5 transition-colors duration-200"
          title="Visualização de Satélite"
        >
          Satélite
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="togglePoints"
          class="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-blue-100 text-gray-700 flex items-center gap-2 transition-colors duration-200"
          title="Mostrar ou Esconder os Pontos de Dados"
        >
          <span class="material-icons text-sm">{{
            showPoints ? "visibility_off" : "visibility"
          }}</span>
          {{ showPoints ? "Esconder" : "Mostrar" }}
        </button>

        <button
          v-if="analysisResult"
          @click="clearAnalysis"
          class="px-3 py-1.5 border border-red-400 text-red-500 rounded-md bg-white hover:bg-red-100 flex items-center gap-2 transition-colors duration-200"
          title="Limpar polígono e resultados da análise"
        >
          <span class="material-icons text-sm">delete_forever</span>
          Limpar
        </button>
      </div>
    </div>

    <div
      v-if="analysisResult"
      class="absolute top-4 right-4 z-[9999] bg-white shadow-xl rounded-lg border border-gray-200 w-72 p-5"
    >
      <h3
        class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
      >
        <span class="material-icons text-blue-500">analytics</span>
        Análise da Área
      </h3>
      <div class="grid grid-cols-1 gap-3">
        <div
          class="flex justify-between items-center bg-blue-50 rounded-md p-3"
        >
          <span class="text-sm text-gray-600">Total de Pontos</span>
          <span class="font-semibold text-blue-700">{{
            analysisResult.totalPoints
          }}</span>
        </div>
        <div
          class="flex justify-between items-center bg-green-50 rounded-md p-3"
        >
          <span class="text-sm text-gray-600">Soma dos Valores</span>
          <span class="font-semibold text-green-700">{{
            analysisResult.sum
          }}</span>
        </div>
        <div
          class="flex justify-between items-center bg-yellow-50 rounded-md p-3"
        >
          <span class="text-sm text-gray-600">Média dos Valores</span>
          <span class="font-semibold text-yellow-700">{{
            analysisResult.mean
          }}</span>
        </div>
        <div
          class="flex justify-between items-center bg-purple-50 rounded-md p-3"
        >
          <span class="text-sm text-gray-600">Mediana dos Valores</span>
          <span class="font-semibold text-purple-700">{{
            analysisResult.median
          }}</span>
        </div>
      </div>
    </div>

    <div id="map" class="h-full w-full inset-0 z-0"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMap } from "@/composables/useMap";

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
} = useMap("map");

onMounted(() => {
  init();
});
</script>
