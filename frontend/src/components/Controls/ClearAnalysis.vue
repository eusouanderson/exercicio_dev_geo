<template>
  <button
    v-if="visible"
    @click="$emit('clear')"
    class="px-3 py-1.5 border border-red-400 text-red-500 rounded-md bg-white hover:bg-red-100 flex items-center gap-2 transition-colors duration-200"
  >
    <span class="material-icons text-sm">delete_forever</span>
    Limpar
  </button>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
defineEmits<{ (e: "clear"): void }>();
</script>
