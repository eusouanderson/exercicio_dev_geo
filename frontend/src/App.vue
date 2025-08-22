<template>
  <div>
    <MapView />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MapView from "@/components/MapView.vue";

export default defineComponent({
  name: "App",
  components: {
    MapView,
  },
});
</script>
