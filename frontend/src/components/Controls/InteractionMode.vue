<template>
  <div class="flex rounded-md overflow-hidden border">
    <button
      @click="$emit('update', 'navigate')"
      :class="[
        modelValue === 'navigate'
          ? 'bg-blue text-white'
          : 'backdrop-blur-sm hover:bg-blue-100 text-gray-700',
        'px-3 py-1.5 flex items-center gap-2 transition-colors duration-200',
      ]"
      title="Navegar e Adicionar Pinos"
    >
      <span class="material-icons text-sm">place</span>
      Navegar
    </button>

    <button
      @click="$emit('update', 'draw')"
      :class="[
        modelValue === 'draw'
          ? 'bg-blue text-white'
          : 'backdrop-blur-sm hover:bg-blue-100 text-gray-700',
        'px-3 py-1.5 flex items-center gap-2 transition-colors duration-200',
      ]"
      title="Desenhar Polígonos"
    >
      <span class="material-icons text-sm">draw</span>
      Desenhar
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: "navigate" | "draw" }>();
defineEmits<{
  (e: "update", value: "navigate" | "draw"): void;
}>();
</script>
