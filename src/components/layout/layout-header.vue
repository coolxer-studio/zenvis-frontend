<template>
  <a-layout class="app-container">
    <a-layout-header class="header">
      <nav-logo></nav-logo>
      <nav-menu></nav-menu>
    </a-layout-header>
    <a-layout class="drawer-body" id="drawer-body">
      <a-layout-content class="app-body">
        <div class="layout-content-body no-scrollbar">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
  import navMenu from './components/nav-menu.vue';
  import navLogo from './components/nav-logo.vue';
</script>

<style lang="scss" scoped>
  .app-container {
    width: 100%;
    height: 100%;
    .header {
      padding: 0;
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

  .app-body {
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #eaeaea;
  }

  .layout-content-body {
    box-sizing: border-box;
    height: 100%;
    overflow-y: auto;
  }
</style>
