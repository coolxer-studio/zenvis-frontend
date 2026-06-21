import { defineConfig, loadEnv } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { resolve } from 'path';
import DefineOptions from 'unplugin-vue-define-options/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import viteCompression from 'vite-plugin-compression';

import {
  createStyleImportPlugin,
  VantResolve,
  ElementPlusResolve,
  NutuiResolve,
} from 'vite-plugin-style-import';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // 读取环境变量
  const env = loadEnv(mode, process.cwd());
  const reg = new RegExp('^' + env.VITE_BASE_URL);
  return defineConfig({
    base: '/',
    // assetsInclude: ['**/*.png', '**/*.ttf'],
    server: {
      port: 8090,
      host: '0.0.0.0',
      proxy: {
        [env.VITE_BASE_URL]: {
          target: env.VITE_BASE_API,
          changeOrigin: true,
          rewrite: path => path.replace(reg, ''),
          configure: (proxy, options) => {
             // 配置代理逻辑
           },
        },
      },
    },
    build: {
      target: 'es2018',
      outDir: 'dist',
      assetsDir: 'static',
      minify: 'terser',
      // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      cssCodeSplit: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          // static/js/[name]-[hash].js
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          // assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          assetFileNames: assetInfo => {
            if (assetInfo.name) {
              const info = assetInfo.name.split('.');
              let extType = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                extType = 'images';
              } else if (/woff|woff2|ttf/.test(extType)) {
                extType = 'fonts';
              }
              return `static/${extType}/[name]-[hash][extname]`;
            } else {
              return 'static/other/[name]-[hash][extname]';
            }
          },
          manualChunks: {
            // 拆分代码，分包。
            vue: ['vue', 'vue-router', 'pinia'],
            // vant: ['vant'],
            // echarts: ['echarts'],
          },
        },
      },
      chunkSizeWarningLimit: 10240,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@a/styles/variable.scss";',
        },
        less: {
          javascriptEnabled: true,
          // 增加超时时间避免LESS编译超时
          timeout: 60000
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@c': resolve('src/components'),
        '@a': resolve('src/assets'),
        '@r': resolve('src/router'),
        '@s': resolve('src/store'),
        '@v': resolve('src/views'),
        '@u': resolve('src/utils'),
      },
    },
    plugins: [
      vue(),
      // webUpdateNotice({
      //   logVersion: true,
      // }),
      DefineOptions(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      createStyleImportPlugin({
        resolves: [
          VantResolve(),
          ElementPlusResolve(),
          NutuiResolve(),
        ],
      }),
      vueJsx({
        // options are passed on to @vue/babel-plugin-jsx
      }),
      // splitVendorChunkPlugin() 已被移除，使用上面的 manualChunks 替代
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(__dirname, 'src/assets/svg-icon')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
    optimizeDeps: {
      include: ['quill',
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker',
      'monaco-editor/esm/vs/editor/editor.worker'
      ],
    },
  });
};