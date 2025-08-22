<template>
  <button
    @click="$emit('toggle')"
    :class="[
      'px-3 py-1.5 border rounded-md flex items-center gap-2 transition-colors duration-200',
      modelValue
        ? 'bg-blue '
        : 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200',
    ]"
  >
    <span class="material-icons text-sm">
      {{ modelValue ? "visibility_off" : "visibility" }}
    </span>
    {{ modelValue ? "Esconder" : "Mostrar" }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>();
defineEmits<{ (e: "toggle"): void }>();
</script>
