<template>
  <div class="relative flex items-center gap-2">
    <div class="relative">
      <input
        v-model="searchQuery"
        @input="onSearchInput"
        @keyup.enter="performSearch"
        @focus="onFocus"
        placeholder="Buscar cidade, bairro, endereço..."
        class="h-10 w-64 pl-3 pr-10 text-sm rounded-md border border-gray-300 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-100 hover:text-gray-700 text-sm"
      >
        ✕
      </button>
    </div>

    <button
      @click="performSearch"
      :disabled="isLoading || !searchQuery.trim()"
      class="h-10 px-3 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm flex items-center justify-center"
    >
      <span v-if="isLoading">...</span>
      <span v-else>🔍</span>
    </button>

    <div
      v-if="searchResults.length"
      class="absolute top-full left-0 mt-1 w-80 bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      <div
        v-for="(result, index) in searchResults"
        :key="index"
        @click="selectResult(result)"
        class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
      >
        <div class="font-medium text-sm text-gray-800">
          {{ result.display_name }}
        </div>
        <div class="text-xs text-gray-500 capitalize">{{ result.type }}</div>
      </div>
    </div>

    <div
      v-if="error"
      class="absolute top-full left-0 mt-1 w-80 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import {
  useGeocodingService,
  type SearchResult,
} from "@/services/geocodingService";

const emit = defineEmits<{
  (event: "locationSelected", result: SearchResult): void;
  (event: "focus"): void;
  (event: "blur"): void;
}>();

const { searchResults, isLoading, error, searchLocation, clearResults } =
  useGeocodingService();
const searchQuery = ref("");
let searchTimeout: number | null = null;

const debounce = (func: Function, delay: number) => {
  return (...args: any[]) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = window.setTimeout(() => func.apply(null, args), delay);
  };
};

const onFocus = () => {
  emit("focus");
};

const debouncedSearch = debounce(() => {
  if (searchQuery.value.trim()) {
    searchLocation(searchQuery.value);
  }
}, 500);

const onSearchInput = () => {
  debouncedSearch();
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    searchLocation(searchQuery.value);
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  clearResults();
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
};

const selectResult = (result: SearchResult) => {
  emit("locationSelected", result);
  clearResults();
  searchQuery.value = result.display_name;
};

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});

watch(searchQuery, (newValue) => {
  if (!newValue.trim()) {
    clearResults();
  }
});
</script>
