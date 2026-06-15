<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { SystemService } from '@/service/api';

dayjs.locale('zh-cn');

export default {
  name: 'RootApp',
  setup() {
    const updateFavicon = (iconUrl: string) => {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon && iconUrl) {
        const timestamp = Date.now();
        const fullUrl = iconUrl.startsWith('http')
          ? `${iconUrl}?t=${timestamp}`
          : `/zenvis${iconUrl.startsWith('/') ? '' : '/'}${iconUrl}?t=${timestamp}`;
        favicon.href = fullUrl;
      }
    };

    const loadSystemInfo = async () => {
      try {
        const res: any = await SystemService.getSystemInfo();
        if (res?.systemIcon) {
          updateFavicon(res.systemIcon);
        }
      } catch (error) {
        console.error('获取系统信息失败:', error);
      }
    };

    loadSystemInfo();

    return { locale: zhCn };
  },
};
</script>

<style lang="scss"></style>
