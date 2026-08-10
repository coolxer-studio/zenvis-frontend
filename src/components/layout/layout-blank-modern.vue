<template>
  <main class="blank-layout">
    <router-view v-slot="{ Component, route }">
      <transition name="zv-page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>
</template>

<script setup lang="ts">
defineOptions({ name: 'LayoutBlankModern' });
</script>

<style lang="scss" scoped>
.blank-layout {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: var(--zv-text);
  background: var(--zv-bg);
}

.blank-layout > :deep(*) {
  width: 100%;
  height: 100%;
}
</style>
