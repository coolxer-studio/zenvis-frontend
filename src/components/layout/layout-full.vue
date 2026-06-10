<template>
  <a-layout class="app-container">
    <a-layout-header v-show="isShow" class="header">
      <nav-logo></nav-logo>
      <nav-menu></nav-menu>
      <arrows-alt-outlined class="arrows-alt-outlined" @click="hideHeader"/>
    </a-layout-header>
    <a-layout class="drawer-body" id="drawer-body">
      <a-layout-content class="app-body">
        <shrink-outlined v-show="!isShow" class="shrink-outlined" @click="showHeader"/>
        <div class="layout-content-body no-scrollbar">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
  import {ref} from "vue";
  import { ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons-vue';


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
</script>

<style lang="scss" scoped>
  .app-container {
    width: 100%;
    height: 100%;
    position: relative;
    .header {
      padding: 0;
      position: relative;
      .logo{
        width: 300px;
        height: 60px;
        line-height: 60px;
        float: left;
        color: #fff;
        padding-left: 20px;
        font-size: 26px;
      }
      .arrows-alt-outlined{
        position: absolute;
        top: 70px;
        right: 10px;
        color: #e5e0e0;
        font-size: 20px;
        z-index: 999;
      }
    }
  }

  .app-body {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #eaeaea;
    position: relative;
    .shrink-outlined{
      position: absolute;
      top: 10px;
      right: 10px;
      color: #e5e0e0;
      font-size: 20px;
      z-index: 9999;
    }
  }

  .layout-content-body {
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
  }
</style>
