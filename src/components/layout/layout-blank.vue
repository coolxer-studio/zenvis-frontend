<template>
  <a-layout class="app-container">
    <a-layout class="drawer-body" id="drawer-body">
      <a-layout-content class="app-body">
        <div class="layout-content-body no-scrollbar">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%;
}

.app-body {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #fff;
}

.layout-content-body {
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}
</style>
