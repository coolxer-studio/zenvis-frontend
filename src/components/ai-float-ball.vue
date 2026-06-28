<template>
  <div class="ai-float-ball-wrapper" :style="wrapperStyle">
    <transition name="fade">
      <div
        v-show="isVisible"
        class="ai-float-ball"
        @mousedown="onDragStart"
        @click="onBallClick"
      >
        <img :src="copilotImg" alt="copilot" class="ai-float-ball-img" />
      </div>
    </transition>

    <transition name="slide-up">
      <div v-if="isExpanded" class="ai-chat-window-container">
        <div class="chat-header">
          <button class="action-btn" @click="shareWindow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>
          <button class="action-btn" @click="closeWindow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <view-center :suggestions="[]" :chat-session-id="chatSessionId" chat-session-type="ask" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ViewCenter from '@/views/dih/components/view-center.vue';
import { generateUUID } from '@/utils/util-common';
import copilotImg from '@/assets/images/copilot.png';

const route = useRoute();
const isExpanded = ref(false);
const chatSessionId = ref('');

// 拖拽相关状态
const isDragging = ref(false);
const justDragged = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const ballPosition = ref({ right: 30, bottom: 30 });
let dragEndTimeout: ReturnType<typeof setTimeout>;

const wrapperStyle = computed(() => ({
  right: `${ballPosition.value.right}px`,
  bottom: `${ballPosition.value.bottom}px`,
}));

const isLoginOrDihPage = computed(() => {
  return route.path === '/user/login' || route.path === '/service/dih';
});
const hiddenByScroll = ref(false);

const isVisible = computed(() => {
  return !isLoginOrDihPage.value && !isExpanded.value && !hiddenByScroll.value;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value && !chatSessionId.value) {
    chatSessionId.value = generateUUID();
  }
};

const closeWindow = () => {
  isExpanded.value = false;
};

const shareWindow = () => {
  if (chatSessionId.value) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#/service/dih?type=ask&chatSessionId=${chatSessionId.value}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }
};

// 拖拽开始
const onDragStart = (e: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value = { x: e.clientX, y: e.clientY };
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
};

// 拖拽移动
const onDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  justDragged.value = true;
  const deltaX = dragOffset.value.x - e.clientX;
  const deltaY = dragOffset.value.y - e.clientY;
  dragOffset.value = { x: e.clientX, y: e.clientY };
  ballPosition.value = {
    right: ballPosition.value.right + deltaX,
    bottom: ballPosition.value.bottom + deltaY,
  };
};

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false;
  clearTimeout(dragEndTimeout);
  dragEndTimeout = setTimeout(() => {
    justDragged.value = false;
  }, 300);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
};

// 点击事件（仅在非拖拽时触发）
const onBallClick = () => {
  if (!isDragging.value && !justDragged.value) {
    toggleExpand();
  }
};

let scrollTimeout: ReturnType<typeof setTimeout>;
const handleScroll = () => {
  if (isLoginOrDihPage.value) return;
  clearTimeout(scrollTimeout);
  hiddenByScroll.value = true;
  scrollTimeout = setTimeout(() => {
    if (!isLoginOrDihPage.value) {
      hiddenByScroll.value = false;
    }
  }, 2000);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  clearTimeout(scrollTimeout);
  clearTimeout(dragEndTimeout);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
});
</script>

<style lang="scss" scoped>
.ai-float-ball-wrapper {
  position: fixed;
  z-index: 9999;
}

.ai-float-ball {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.8;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
  }

  .ai-float-ball-img {
    width: 56px;
    height: 56px;
  }
}

.ai-chat-window-container {
  width: 450px;
  max-height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 15px;

  :deep(.center-panel) {
    flex: 1;
    border-radius: 0;
    box-shadow: none;
    min-height: 0;
  }

  :deep(.center-header) {
    display: none;
  }

  :deep(.chat-content) {
    padding: 12px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  :deep(.input-area) {
    padding: 10px;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
  }

  :deep(.suggestions) {
    display: none;
  }

  :deep(.message-list) {
    gap: 20px;
    padding: 10px;
  }

  :deep(.message-bubble) {
    max-width: 90%;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
