<template>
  <div class="flex rounded-md overflow-hidden border">
    <button
      @click="$emit('toggle')"
      :class="[
        'h-10 px-3 py-2 flex items-center gap-2 rounded-md text-sm transition-colors duration-200',
        modelValue
          ? 'bg-blue text-white'
          : 'bg-green-50 border-green-400 text-green-700 hover:bg-green-200',
      ]"
      title="Esconder ou mostrar Pinos"
    >
      <span class="material-icons text-base">
        {{ modelValue ? "visibility_off" : "visibility" }}
      </span>
      {{ modelValue ? "Esconder" : "Mostrar" }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>();
defineEmits<{ (e: "toggle"): void }>();
</script>
