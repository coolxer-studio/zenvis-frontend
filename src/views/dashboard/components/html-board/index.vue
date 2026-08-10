<template>
  <PluginFrame :src="iframeUrl" title="可视化大屏" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeIframeUrl, withBaseUrl } from '@u/url';
import PluginFrame from '@c/plugin-frame.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const iframeUrl = computed(() => {
  const htmlPath = String(props.data?.htmlPath || '').trim();
  return sanitizeIframeUrl(htmlPath ? withBaseUrl(`/html-page/${htmlPath}`) : '');
});
</script>
