<template>
  <div class="login-background"></div>
  <div class="login_msg_tip">
    <div class="msg_tip_box">
      <div class="login_tip_title">{{ systemInfo?.productName }}</div>
      <div class="login_tip_content">{{ systemInfo?.productIntroduction }}</div>
    </div>
  </div>
  <div class="login-form">
    <a-form
      :model="formLogin"
      name="login"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <div class="login-logo-title">
        <div class="logo"></div>
        <div class="title">{{ systemInfo?.systemTitle }}</div>
      </div>
      <a-form-item name="user_name" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input
          class="login-input"
          size="large"
          placeholder="请输入账号"
          v-model:value="formLogin.user_name"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
        <a-input-password
          class="login-input"
          size="large"
          placeholder="请输入密码"
          v-model:value="formLogin.password"
        >
        </a-input-password>
      </a-form-item>

      <a-form-item name="auth_code" :rules="[{ required: true, message: '请输入验证码' }]">
        <div class="form-row form-code">
          <a-input
            class="login-input"
            size="large"
            placeholder="请输入验证码"
            v-model:value="formLogin.auth_code"
          >
          </a-input>
          <div class="code-img">
            <img
              class="login_auth_pic"
              :src="captchaUrl"
              style="width: 100%; height: 100%"
              @click="refreshCaptcha"
            />
          </div>
        </div>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
        <a-button class="throttle" size="large" block type="primary" html-type="submit" :loading="loginLoading"
          >登 录</a-button
        >
        <a target="_blank" href="http://genie.coolxer.com/#/快速了解x-genie">接入指南</a>
      </a-form-item>
    </a-form>
  </div>
  <div class="login-footer">
    {{ systemInfo?.copyright }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { UserService } from '@/service/api/api-user';
import { SystemService } from '@/service/api/api-system';
import { SystemInfo } from '@/service/types/type-system';
import JSEncrypt from 'jsencrypt';
import { ls } from '@u/local-storage';

interface IFromLogin {
  user_name: string;
  password: string;
  auth_code: string;
}

export default defineComponent({
  name: 'ampLogin',
  setup() {
    const store = useStore();
    const router = useRouter();
    const loginLoading = ref(false);
    const timestamp = ref(+new Date());
    
    const systemInfo = ref<SystemInfo>();
    
    const formLogin = reactive<IFromLogin>({
      user_name: '',
      password: '',
      auth_code: '',
    });

    const captchaUrl = computed(() => {
      return `/x-genie/api/v1/system/login/kaptcha?${timestamp.value}=${timestamp.value}`;
    });

    const onFinish = async () => {
      try {
        loginLoading.value = true;
        const encryptor = new JSEncrypt();
        const res: any = await UserService.getEncrypyKey();
        encryptor.setPublicKey(res.key);
        const loginRes: any = await UserService.doLogin({ 
          ...formLogin, 
          password: encryptor.encrypt(formLogin.password) as string
        });
        
        ls.set('__login__', 'ok');
        ls.set('__user__', loginRes.user);
        ls.set('__permission__', loginRes.permission);
        
        router.push({
          name: 'dashboard',
        });
      } catch (err: any) {
        if (err && err.code == 102) {
          refreshCaptcha();
        }
      } finally {
        loginLoading.value = false;
      }
    };

    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };

    const getSystemInfoFun = async () => {
      try {
        systemInfo.value = await SystemService.getSystemInfo();
      } catch (error) {
        console.error('获取系统信息失败:', error);
      }
    };

    const refreshCaptcha = () => {
      timestamp.value = +new Date();
    };

    // 初始化
    getSystemInfoFun();
    refreshCaptcha();

    return {
      systemInfo,
      timestamp,
      formLogin,
      loginLoading,
      captchaUrl,
      onFinish,
      onFinishFailed,
      refreshCaptcha,
    };
  },
});
</script>

<style lang="less" scoped>
.login-background {
  width: 100vw;
  //min-width: 1364px;
  height: 100vh;
  min-height: 600px;
  background-size: 100% 100%;
  background: #e8eff4;
}
.login_msg_tip {
  background: url('@a/images/login_banner.png');
  position: absolute;
  z-index: 40;
  width: 570px;
  height: 570px;
  right: 50%;
  top: 10%;
  .msg_tip_box {
    padding: 14px;
    box-sizing: border-box;
    .login_tip_title {
      height: 34px;
      text-align: center;
      font-size: 24px;
      line-height: 34px;
      font-weight: bold;
      color: #50605e;
    }
    .login_tip_content {
      margin-top: 30px;
      height: 34px;
      text-align: center;
      font-size: 14px;
      line-height: 24px;
      color: #6c8885;
      white-space: pre-line; /* 解析并显示换行符 */
    }
  }
}

.throttle {
  //height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  background: #3988ff;
  color: #fff;
  //line-height: 32px;
  text-align: center;
  cursor: pointer;
}
.login-footer {
  position: absolute;
  bottom: 5px;
  width: 100%;
  text-align: center;
  color: #7c8087;
  font-size: 12px;
}
.login-form {
  background: #fff;
  width: 570px;
  height: 570px;
  padding: 100px;
  position: absolute;
  left: 50%;
  top: 10%;
  font-size: 14px;
  box-sizing: border-box;
  line-height: 20px;
  font-weight: normal;
  font-style: normal;
  display: flex;
  align-items: center;
  flex-direction: column;

  ::v-deep(.ant-form) {
    width: 100%;
  }

  .login-logo-title {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 20px;
    .logo {
      width: 50px;
      height: 50px;
      background: url('@a/images/icon-logo.png');
      background-size: cover; /* 将背景图片调整为覆盖整个元素 */
      background-repeat: no-repeat; /* 防止背景图片重复显示 */
    }
    .title {
      margin-left: 20px;
      font-size: 18px;
      font-weight: bold;
    }
  }
  .login-input {
    //line-height: 32px;
    //height: 32px;
    // width: 400px;
    outline: none;
    font-size: 14px;
    //text-indent: 10px;
    transition: 0.3s;
    box-sizing: border-box;
    border: 1px solid #aeb7c9;
  }
  .form-row {
    display: flex;
    align-items: center;

    .ant-input {
      flex: 3;
    }

    .code-img {
      flex: 1;
      height: 40.14px;
      //background: rgb(187, 187, 187);
      margin-left: 10px;
    }
    .login_auth_pic {
      height: 39.14px;
      border: 1px solid rgb(217, 215, 215);
    }

    .form-btn {
      flex-shrink: 0;
    }
  }
  .icon {
    font-size: 12px;
  }
  .form-code {
    ::v-deep(.ant-input-affix-wrapper) {
      width: 150px;
    }
  }
}
</style>
