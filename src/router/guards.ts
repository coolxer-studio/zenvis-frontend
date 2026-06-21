import { Router } from 'vue-router';
import { setSalt, setToken } from '@u/ls';

export default function (router: Router) {
  router.beforeEach((to, form, next) => {
    const { token, salt } = to.query;
    if (token) {
      setToken(token as string);
      setSalt(salt as string);
      next();
    } else {
      // TODO: 如果没有token，需要做些处理
      next();
    }
  });

  router.afterEach((to, form) => {
    // TODO: 取消所有请求？销毁所有弹框等？
    // console.log(to, 'after');
    // console.log(form, 'after');
  });
  return router;
}
