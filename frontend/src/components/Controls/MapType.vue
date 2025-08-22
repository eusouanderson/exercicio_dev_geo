<template>
  <div class="flex rounded-md overflow-hidden border">
    <button
      @click="$emit('update', 'roadmap')"
      :class="[
        modelValue === 'roadmap'
          ? 'bg-blue text-white'
          : 'backdrop-blur-sm hover:bg-blue-100 text-gray-700',
        'px-3 py-1.5 border-r border-gray-300 transition-colors duration-200',
      ]"
      title="Tipo do Mapa"
    >
      <span class="material-icons text-sm">map</span>
      Mapa
    </button>

    <button
      @click="$emit('update', 'satellite')"
      :class="[
        modelValue === 'satellite'
          ? 'bg-blue text-white'
          : 'backdrop-blur-sm hover:bg-blue-100 text-gray-700',
        'px-3 py-1.5 transition-colors duration-200',
      ]"
      title="Tipo do Mapa"
    >
      <span class="material-icons text-sm">satellite</span>
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
