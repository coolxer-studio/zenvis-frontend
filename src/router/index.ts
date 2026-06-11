import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { ls } from '@u/local-storage';
import layout_blank from '@c/layout/layout-blank.vue';
import layout_header from '@c/layout/layout-header.vue';
import layout_full from '@c/layout/layout-full.vue';
const basicRoutes: Array<RouteRecordRaw> = [
  {
    path: `/user`,
    component: layout_blank,
    redirect: `/user/login`,
    children: [
      {
        path: 'login',
        component: () => import('@v/login/index.vue'),
        name: 'login'
      }
    ]
  },
  {
    path: `/aggregate`,
    component: layout_header,
    redirect: `/aggregate/index`,
    children: [
      {
        path: 'index',
        component: () => import('@v/aggregate/index.vue'),
        name: 'aggregate'
      }
    ]
  },
  {
    path: `/dashboard`,
    component: layout_full,
    redirect: `/dashboard/index`,
    children: [
      {
        path: 'index',
        component: () => import('@v/dashboard/index.vue'),
        name: 'dashboard'
      }
    ]
  },
  {
    path: `/retrieval`,
    component: layout_header,
    children: [
      {
        path: 'index',
        component: () => import('@v/retrieval/index.vue'),
        name: 'retrieval'
      }
    ]
  },
  {
    path: `/service`,
    component: layout_header,
    children: [
      {
        path: 'dih',
        component: () => import('@v/dih/index.vue'),
        name: 'service-dih'
      },
      {
        path: 'low-code-app/:menuParams',
        component: () => import('@v/low-code-app/index.vue'),
        name: 'low-code-app'
      },
      {
        path: 'low-code-page/:menuParams',
        component: () => import('@v/low-code-page/index.vue'),
        name: 'low-code-page'
      },
      {
        path: 'external-app/:menuParams',
        component: () => import('@v/external-app/index.vue'),
        name: 'external-app'
      }
    ]
  },
    {
    path: `/service`,
    component: layout_blank,
    children: [
      {
        path: 'integrated',
        component: () => import('@v/integrated/index.vue'),
        name: 'service-integrated'
      }
    ]
  },
  {
    path: `/plugin/config`,
    component: layout_blank,
    children: [
       {
        path: '::menuParams',
        component: () => import('@v/policy/index.vue'),
        name: 'plugin-config'
      }
    ]
  },
  {
    path: `/policy`,
    component: layout_header,
    children: [
       {
        path: '::menuParams',
        component: () => import('@v/policy/index.vue'),
        name: 'policy-config'
      }
    ]
  },
  {
    path: `/system`,
    component: layout_header,
    children: [
      {
        path: 'about',
        component: () => import('@v/about/index.vue'),
        name: 'system-about'
      }
    ]
  }
];

const routes: Array<RouteRecordRaw> = [
  ...basicRoutes,
  {
    path: '/',
    redirect: '/dashboard/index'
  },
  {
    path: '/ExceptionPage404',
    name: 'ExceptionPage404',
    component: () => import('@v/pages-error/404.vue'),
  },
  {
    path: '/ExceptionPage403',
    name: 'ExceptionPage403',
    component: () => import('@v/pages-error/403.vue'),
  },
  {
    path: '/ExceptionPage500',
    name: 'ExceptionPage500',
    component: () => import('@v/pages-error/500.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/**
 * description: 路由守卫设置
 */
router.beforeEach(async (to, from, next) => {
  // 读取token值
  let loginStatus = ls.get('__login__');
  // 检查系统配置是否存在
  // await checkSystemConfig();

  if ((loginStatus === null || loginStatus === '') && to.path !== `/user/login`) {
    console.log(to.path);
    // 没有token，同时访问地址不是登录页--> 跳转登录页，带参数
    if (to.fullPath == '/ExceptionPage500') {
      next({
        path: `/user/login`,
      });
    } else {
      next({
        path: `/user/login`,
        query: { redirect: to.fullPath },
      });
    }
  } else if ((loginStatus === null || loginStatus === '') && to.path === `/user/login`) {
    // 没有token，同时访问地址不是登录页--> 跳转登录页，带参数
    next();
  } else if (loginStatus !== null && loginStatus !== '' && to.path === `/user/login`) {
    // 有，同时访问地址是登录页--> 跳转首页
    next('/dashboard/index');
  }
  // console.log(to.matched);
  if (to.matched.length !== 0) {
    next();
  } else {
    next({
      path: '/404',
      replace: true,
    });
  }
});

export default router;
