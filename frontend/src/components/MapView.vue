<template>
  <div id="map-container">
    <div id="controls" class="controls">
      <div class="mode-switcher">
        <button
          @click="setInteractionMode('navigate')"
          :class="{ active: interactionMode === 'navigate' }"
          title="Navegar e Adicionar Pinos"
        >
          📍 Navegar
        </button>
        <button
          @click="setInteractionMode('draw')"
          :class="{ active: interactionMode === 'draw' }"
          title="Desenhar Polígonos"
        >
          ✏️ Desenhar
        </button>
      </div>

      <button @click="togglePoints" class="toggle-button">
        {{ showPoints ? "Esconder Pontos" : "Mostrar Pontos" }}
      </button>
    </div>

    <div v-if="analysisResult" class="analysis-panel">
      <h3>Análise da Área Desenhada</h3>
      <ul>
        <li>
          <strong>Total de Pontos:</strong> {{ analysisResult.totalPoints }}
        </li>
        <li><strong>Soma dos Valores:</strong> {{ analysisResult.sum }}</li>
        <li><strong>Média dos Valores:</strong> {{ analysisResult.mean }}</li>
        <li>
          <strong>Mediana dos Valores:</strong> {{ analysisResult.median }}
        </li>
      </ul>
    </div>

    <div id="map" style="height: 100vh; width: 100%"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMap } from "@/composables/useMap";

// Obter tudo o que o template precisa do nosso composable
const {
  showPoints,
  togglePoints,
  init,
  analysisResult,
  interactionMode,
  setInteractionMode,
} = useMap("map");

onMounted(() => {
  init();
});
</script>

<style scoped>
#map-container {
  height: 100vh;
  width: 100%;
  position: relative;
}

.controls {
  position: absolute;
  top: 10px;
  /* Posicionado à esquerda dos controles de desenho do Leaflet */
  left: 50px;
  z-index: 1000;
  background: white;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-switcher {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
}

.mode-switcher button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-right-width: 0;
}

.mode-switcher button:last-child {
  border-right-width: 1px;
}

.mode-switcher button.active {
  background-color: #3388ff;
  color: white;
  border-color: #3388ff;
}

.mode-switcher button:not(.active):hover {
  background-color: #f4f4f4;
}

.toggle-button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.toggle-button:hover {
  background-color: #f4f4f4;
}

.analysis-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  width: 250px;
}

.analysis-panel h3 {
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #ccc;
  font-size: 16px;
}

.analysis-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}

.analysis-panel li {
  margin-bottom: 5px;
}
</style>
