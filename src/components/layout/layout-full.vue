<template>
  <el-container class="app-container">
    <el-header v-show="isShow" class="header">
      <nav-logo></nav-logo>
      <nav-menu></nav-menu>
    </el-header>
    <el-container class="drawer-body" id="drawer-body">
      <TopRight v-show="isShow" class="toggle-icon" @click="hideHeader"/>
      <BottomLeft v-show="!isShow" class="toggle-icon" @click="showHeader"/>
      <el-main class="app-body">
        <div class="layout-content-body no-scrollbar">
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
  import {ref, onMounted, onUnmounted} from "vue";
  import { TopRight, BottomLeft } from '@element-plus/icons-vue';


  import navMenu from './components/nav-menu.vue';
  import navLogo from './components/nav-logo.vue';
  const isShow = ref<boolean>(true)
  const hideHeader = () => {
    isShow.value = false

    // 全屏
    const el = document.querySelector('#drawer-body');
    if (el?.requestFullscreen) {
      el.requestFullscreen();
    }
  }
  const showHeader = () => {
    isShow.value = true

    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      isShow.value = true;
    }
  }
  
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  })
  
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  })
</script>

<style lang="scss" scoped>
  .app-container {
    width: 100%;
    height: 100%;
    position: relative;
    .header {
      padding: 0;
      position: relative;
      background-color: #3988ff;
      .logo{
        width: 300px;
        height: 60px;
        line-height: 60px;
        float: left;
        color: #fff;
        padding-left: 20px;
        font-size: 26px;
      }
    }
  }
  
  .drawer-body {
    position: relative;
    .toggle-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      color: #e5e0e0;
      font-size: 20px;
      z-index: 9999;
      width: 25px;
      height: 25px;
    }
  }

  .app-body {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #eaeaea;
    padding: 0;
    position: relative;
  }

  .layout-content-body {
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
  }
</style>
