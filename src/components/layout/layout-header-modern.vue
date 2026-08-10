<template>
  <div class="zenvis-shell">
    <header class="app-header">
      <nav-logo-modern />
      <nav-menu-modern />
    </header>
    <main class="app-workspace">
      <router-view v-slot="{ Component, route }">
        <transition name="zv-page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavLogoModern from './components/nav-logo-modern.vue';
import NavMenuModern from './components/nav-menu-modern.vue';

defineOptions({ name: 'LayoutHeaderModern' });
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
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02), 0 8px 30px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(18px) saturate(145%);
}

.app-workspace {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--zv-bg);
}

.app-workspace :deep(.plugin-frame) {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}
</style>
