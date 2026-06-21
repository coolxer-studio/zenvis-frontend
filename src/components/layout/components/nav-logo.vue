<template>
  <div class="logo">{{ systemInfo?.systemTitle }}</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { SystemService } from '@/service/api';
import { SystemInfo } from '@/types/type-system';

export default defineComponent({
  name: 'Logo',
  setup() {
    const systemInfo = ref<SystemInfo>();

    const getSystemInfoFun = async () => {
      try {
        systemInfo.value = await SystemService.getSystemInfo();
      } catch (error) {
        console.error('获取系统信息失败:', error);
      }
    };

    // 在onMounted钩子中调用API
    onMounted(() => {
      getSystemInfoFun();
    });

    return {
      systemInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 300px;
  height: 60px;
  line-height: 60px;
  float: left;
  color: #fff;
  padding-left: 20px;
  font-size: 26px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
