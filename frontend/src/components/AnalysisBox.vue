<template>
  <div class="absolute bottom-4 left-4 z-[999] flex flex-col items-start gap-2">
    <button
      @click="isVisible = !isVisible"
      class="bg-white shadow-lg rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
    >
      <span class="material-icons text-lg">
        {{ isVisible ? "visibility_off" : "visibility" }}
      </span>
      {{ isVisible ? "Ocultar Análises" : "Mostrar Análises" }}
    </button>

    <div
      v-if="isVisible"
      class="flex flex-col gap-4 max-h-[80vh] overflow-y-auto p-2 w-80"
    >
      <div
        v-if="isLoading"
        class="bg-white shadow-lg rounded-xl border border-gray-200 p-6 text-center flex flex-col items-center"
      >
        <svg
          class="animate-spin h-8 w-8 text-blue-500 mb-3"
          xmlns="http://www.w.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="text-gray-500 font-medium">Carregando resultados...</p>
      </div>

      <div
        v-else-if="analyses.length === 0"
        class="bg-white shadow-lg rounded-xl border border-gray-200 p-6 text-center"
      >
        <span class="material-icons text-5xl text-gray-300 mb-2"
          >search_off</span
        >
        <p class="text-gray-500 font-medium">Nenhum resultado encontrado</p>
      </div>

      <div
        v-else
        v-for="item in analyses"
        :key="item.id"
        class="bg-white shadow-lg rounded-xl border border-gray-200 p-5 transition-all duration-300 relative"
      >
        <button
          @click.stop="handleDelete(item.id)"
          class="absolute top-2 right-2 w-7 h-7 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-lg font-bold"
          title="Excluir Análise"
        >
          &times;
        </button>

        <div class="flex items-center mb-4 pr-6">
          <span class="material-icons text-blue-500 text-3xl mr-3"
            >history</span
          >
          <div>
            <h3 class="text-lg font-bold text-gray-800 leading-tight">
              Análise #{{ item.id }}
            </h3>
            <p class="text-xs text-gray-500">
              Criado em: {{ new Date(item.createdAt).toLocaleString() }}
            </p>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span class="material-icons text-gray-500">input</span>
            Prompt Enviado
          </h4>
          <p class="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg font-mono">
            {{ item.prompt }}
          </p>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span class="material-icons text-purple-500">auto_awesome</span>
            Resultado da IA
          </h4>
          <p class="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
            {{ item.result }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listGeminiResults,
  deleteGeminiResult,
} from "@/services/geminiService";

interface GeminiResult {
  id: number;
  prompt: string;
  result: string;
  createdAt: string;
}

const analyses = ref<GeminiResult[]>([]);
const isLoading = ref(true);
// NOVO: Estado para controlar a visibilidade da lista
const isVisible = ref(true);

const fetchAnalyses = async () => {
  isLoading.value = true;
  try {
    const results = await listGeminiResults();
    analyses.value = results.sort(
      (a: GeminiResult, b: GeminiResult) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao buscar as análises:", error);
    analyses.value = [];
  } finally {
    isLoading.value = false;
  }
};

// NOVO: Função para lidar com a exclusão de uma análise
const handleDelete = async (id: number) => {
  // Pede confirmação ao usuário
  const confirmed = confirm(`Tem certeza que deseja excluir a Análise #${id}?`);
  if (!confirmed) {
    return;
  }

  try {
    // Chama o serviço para deletar no backend
    await deleteGeminiResult(id);
    // Remove o item da lista local para atualizar a UI instantaneamente
    analyses.value = analyses.value.filter((item) => item.id !== id);
  } catch (error) {
    console.error(`Erro ao excluir a análise #${id}:`, error);
    alert("Não foi possível excluir a análise.");
  }
};

onMounted(() => {
  fetchAnalyses();
});
</script>
