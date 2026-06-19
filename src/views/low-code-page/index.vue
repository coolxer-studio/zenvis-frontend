<template>
  <iframe
    :src="iframeUrl"
    class="iframe-container"
  />
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const baseUrl = ref<string>('/amis/page.html');
// 提取路径参数并转换为字符串
function getConfigType(): string {
  // 如果 route.params['menuParams'] 不存在，返回默认值 'default'
  return route.params['menuParams']?.toString() || 'default';
}

// 初始化 iframeUrl
const iframeUrl = ref<string>(baseUrl.value+'?config='+getConfigType());

// 监听路由变化
watch(
  () => route.params['menuParams'], // 只监听 route.params['menuParams'] 的变化
  () => {
    iframeUrl.value = baseUrl.value+'?config='+getConfigType();
  },
  { deep: true }
);
</script>
<style lang="scss" scoped>
.iframe-container {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
