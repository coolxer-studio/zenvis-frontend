<template>
  <section class="plugin-frame" :aria-busy="loading">
    <Transition name="plugin-loading">
      <div v-if="loading" class="plugin-frame__loading">
        <NSpin size="large" />
        <div class="plugin-frame__loading-copy">
          <strong>正在载入{{ title || '应用' }}</strong>
          <span>正在同步菜单、权限与页面配置</span>
        </div>
      </div>
    </Transition>

    <iframe
      ref="frameRef"
      :key="iframeSrc"
      :src="iframeSrc"
      :title="title || 'ZenVis 插件应用'"
      class="plugin-frame__iframe"
      :class="{ 'is-ready': !loading }"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      referrerpolicy="no-referrer"
      @load="handleLoad"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NSpin } from 'naive-ui';

const props = withDefaults(
  defineProps<{
    src: string;
    title?: string;
  }>(),
  {
    title: ''
  }
);

const loading = ref(true);
const frameRef = ref<HTMLIFrameElement | null>(null);
const iframeSrc = computed(() => props.src);

const syncIframeUi = () => {
  const frame = frameRef.value;
  if (!frame?.contentWindow) return;
  const targetOrigin = new URL(props.src, window.location.origin).origin;

  try {
    if (targetOrigin === window.location.origin && frame.contentDocument) {
      frame.contentDocument.documentElement.dataset.zenvisUi = '1';
      frame.contentDocument.documentElement.removeAttribute('data-theme');
      frame.contentDocument.documentElement.style.colorScheme = 'light';
    }
  } catch {
    // Cross-origin frames receive the same contract update through postMessage below.
  }

  frame.contentWindow.postMessage(
    { type: 'zenvis:ui', version: '1', colorScheme: 'light' },
    targetOrigin,
  );
};

const handleLoad = () => {
  syncIframeUi();
  window.setTimeout(() => {
    loading.value = false;
  }, 160);
};

watch(
  () => iframeSrc.value,
  () => {
    loading.value = true;
  }
);

</script>

<style scoped lang="scss">
.plugin-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 10% 0%, rgb(var(--zv-primary-rgb) / 8%), transparent 28%),
    var(--zv-bg-canvas);
  isolation: isolate;
}

.plugin-frame__iframe {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--zv-bg-canvas);
  opacity: 0;
  transition: opacity 220ms var(--zv-ease-out);

  &.is-ready {
    opacity: 1;
  }
}

.plugin-frame__loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: var(--zv-text-primary);
  background: rgb(var(--zv-bg-canvas-rgb) / 88%);
  backdrop-filter: blur(12px);
}

.plugin-frame__loading-copy {
  display: grid;
  gap: 5px;

  strong {
    font-size: 15px;
    font-weight: 650;
  }

  span {
    color: var(--zv-text-tertiary);
    font-size: 12px;
  }
}

.plugin-loading-leave-active {
  transition: opacity 260ms ease;
}

.plugin-loading-leave-to {
  opacity: 0;
}
</style>
