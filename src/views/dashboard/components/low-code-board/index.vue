<template>
  <iframe :src="iframeUrl" frameborder="0" class="dashboard-iframe"></iframe>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const iframeUrl = computed(() => '/amis/page.html?config=' + (props.data?.configIndex || ''));
</script>

<style lang="scss" scoped>
.dashboard-iframe {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>