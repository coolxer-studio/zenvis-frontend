<template>
  <div class="zenvis-shell">
    <transition name="header-slide">
      <header v-show="headerVisible" class="app-header">
        <nav-logo-modern />
        <nav-menu-modern />
      </header>
    </transition>

    <main id="dashboard-workspace" ref="workspaceRef" class="app-workspace">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button quaternary circle class="fullscreen-toggle" @click="toggleFullscreen">
            <template #icon>
              <n-icon :size="18">
                <FullScreen v-if="headerVisible" />
                <ScaleToOriginal v-else />
              </n-icon>
            </template>
          </n-button>
        </template>
        {{ headerVisible ? '进入沉浸看板' : '退出沉浸看板' }}
      </n-tooltip>

      <router-view v-slot="{ Component, route }">
        <transition name="zv-page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { NButton, NIcon, NTooltip } from 'naive-ui';
import { FullScreen, ScaleToOriginal } from '@element-plus/icons-vue';

import NavLogoModern from './components/nav-logo-modern.vue';
import NavMenuModern from './components/nav-menu-modern.vue';

defineOptions({ name: 'LayoutFullModern' });

const headerVisible = ref(true);
const workspaceRef = ref<HTMLElement>();

const toggleFullscreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  await workspaceRef.value?.requestFullscreen();
};

const handleFullscreenChange = () => {
  headerVisible.value = !document.fullscreenElement;
};

onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange));
onUnmounted(() => document.removeEventListener('fullscreenchange', handleFullscreenChange));
</script>

<style lang="scss" scoped>
.zenvis-shell {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  flex-direction: column;
  background: var(--zv-bg);
}

.app-header {
  position: relative;
  z-index: 1000;
  display: flex;
  flex: 0 0 var(--zv-header-height);
  align-items: center;
  height: var(--zv-header-height);
  padding-right: 14px;
  background: var(--zv-header);
  border-bottom: 1px solid var(--zv-divider);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(18px) saturate(145%);
}

.app-workspace {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--zv-bg);
}

.app-workspace > :deep(.dashboard-modern) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fullscreen-toggle {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 999;
  color: rgba(255, 255, 255, 0.82);
  width: 34px;
  height: 34px;
  background: rgba(7, 13, 25, 0.44);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(12px);
}

.header-slide-enter-active,
.header-slide-leave-active {
  transition: all 220ms var(--zv-motion);
}

.header-slide-enter-from,
.header-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
