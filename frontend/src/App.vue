<template>
  <div>
    <MapContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MapContainer from "./components/MapContainer.vue";

export default defineComponent({
  name: "App",
  components: {
    MapContainer,
  },
});
</script>
