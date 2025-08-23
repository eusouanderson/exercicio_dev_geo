<!-- AnalysisBox.vue -->
<template>
  <div
    class="absolute top-4 right-4 z-[9999] flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
  >
    <!-- Estado: nenhuma análise -->
    <template v-if="data.length === 0">
      <div
        class="bg-white shadow-xl rounded-lg border border-gray-200 w-72 p-5 flex items-center justify-center text-gray-500"
      >
        Nenhuma análise disponível
      </div>
    </template>

    <!-- Estado: existe análise -->
    <template v-else>
      <div
        v-for="(item, index) in data"
        :key="index"
        class="bg-white shadow-xl rounded-lg border border-gray-200 w-72 p-5"
      >
        <h3
          class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
        >
          <span class="material-icons text-blue-500">analytics</span>
          Análise da Área #{{ index + 1 }}
        </h3>
        <div class="grid grid-cols-1 gap-3">
          <div
            class="flex justify-between items-center bg-blue-50 rounded-md p-3"
          >
            <span class="text-sm text-gray-600">Total de Pontos</span>
            <span class="font-semibold text-blue-700">{{
              item.totalPoints
            }}</span>
          </div>
          <div
            class="flex justify-between items-center bg-green-50 rounded-md p-3"
          >
            <span class="text-sm text-gray-600">Soma dos Valores</span>
            <span class="font-semibold text-green-700">{{ item.sum }}</span>
          </div>
          <div
            class="flex justify-between items-center bg-yellow-50 rounded-md p-3"
          >
            <span class="text-sm text-gray-600">Média dos Valores</span>
            <span class="font-semibold text-yellow-700">{{ item.mean }}</span>
          </div>
          <div
            class="flex justify-between items-center bg-purple-50 rounded-md p-3"
          >
            <span class="text-sm text-gray-600">Mediana dos Valores</span>
            <span class="font-semibold text-purple-700">{{ item.median }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisData } from "@/types/analysis";

defineProps<{ data: AnalysisData[] }>();
</script>
