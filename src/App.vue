<template>
  <n-config-provider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider placement="top-right" :max="4">
          <n-message-provider placement="top" :max="4" closable>
            <el-config-provider :locale="elementLocale">
              <router-view />
              <ai-float-ball />
            </el-config-provider>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import {
  NConfigProvider,
  NDialogProvider,
  NGlobalStyle,
  NLoadingBarProvider,
  NMessageProvider,
  NNotificationProvider,
  dateZhCN,
  zhCN,
} from 'naive-ui';
import elementLocale from 'element-plus/es/locale/lang/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import AiFloatBall from './components/ai-float-ball.vue';
import { useThemeMode } from '@/composables/use-theme-mode';
import { SystemService } from '@/service/api';
import { zenvisDarkTheme, zenvisLightTheme } from '@/theme/naive-theme';
import { getAssetUrl } from '@u/url';

defineOptions({ name: 'RootApp' });

dayjs.locale('zh-cn');

const { isDark, naiveTheme } = useThemeMode();
const themeOverrides = computed(() => (isDark.value ? zenvisDarkTheme : zenvisLightTheme));

const updateFavicon = (iconUrl: string) => {
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (favicon && iconUrl) favicon.href = getAssetUrl(iconUrl);
};

const loadSystemInfo = async () => {
  try {
    const res = await SystemService.getSystemInfo();
    if (res?.systemIcon) updateFavicon(res.systemIcon);
  } catch (error) {
    console.error('获取系统信息失败:', error);
  }
};

onMounted(loadSystemInfo);
</script>
