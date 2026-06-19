<template>
  <iframe :src="data.url" frameborder="0" class="dashboard-iframe"></iframe>
</template>

<script setup lang="ts">
defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="scss" scoped>
.dashboard-iframe {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
