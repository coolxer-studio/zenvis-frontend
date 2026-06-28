import { createApp } from 'vue';

// 引入 Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 引入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import JsonViewer from 'vue3-json-viewer';
import 'vue3-json-viewer/dist/vue3-json-viewer.css';

import 'virtual:svg-icons-register';

import RootApp from './App.vue';
import router from './router';
import pinia from './stores';

import setupComponent from '@c/index';

import '@a/font/index.css';
import '@a/styles/index.scss';
async function initApp() {
  // 创建实例
  const app = createApp(RootApp)
    .use(pinia)
    .use(router)
    .use(ElementPlus) // 使用 Element Plus
    .use(JsonViewer);
    
  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.config.warnHandler = () => null;

  // 注册所有组件
  setupComponent(app);

  // 挂载Dom
  app.mount('#app');
}

initApp();
