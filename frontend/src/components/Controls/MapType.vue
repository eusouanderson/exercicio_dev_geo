<template>
  <div class="flex rounded-md overflow-hidden border">
    <button
      @click="$emit('update', 'roadmap')"
      class="h-10 px-3 text-sm flex items-center gap-2 transition-colors duration-200 border-r border-gray-300"
      :class="
        modelValue === 'roadmap'
          ? 'bg-blue text-white'
          : 'bg-zinc-600 hover:bg-blue-100 text-gray-700'
      "
    >
      <span class="material-icons text-base">map</span>
      Mapa
    </button>

    <button
      @click="$emit('update', 'satellite')"
      class="h-10 px-3 text-sm flex items-center gap-2 transition-colors duration-200"
      :class="
        modelValue === 'satellite'
          ? 'bg-blue text-white'
          : 'bg-zinc-600 hover:bg-blue-100 text-gray-700'
      "
    >
      <span class="material-icons text-base">satellite</span>
      Satélite
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: "roadmap" | "satellite" }>();
defineEmits<{
  (e: "update", value: "roadmap" | "satellite"): void;
}>();
</script>
