<template>
  <div class="login-background"></div>
  <div class="login_msg_tip" :style="getBannerStyle()">
    <div class="msg_tip_box">
      <div class="login_tip_title">{{ systemInfo?.productName }}</div>
      <div class="login_tip_content">{{ systemInfo?.productIntroduction }}</div>
    </div>
  </div>
  <div class="login-form">
    <el-form
      :model="formLogin"
      name="login"
      autocomplete="off"
      @submit.prevent="onFinish"
    >
      <div class="login-logo-title">
        <img v-if="systemInfo?.systemLogo" :src="getLogoUrl()" class="logo" />
        <div v-else class="logo"></div>
        <div class="title">{{ systemInfo?.systemTitle }}</div>
      </div>
      <el-form-item prop="user_name" :rules="[{ required: true, message: '请输入账号', trigger: 'blur' }]">
        <el-input
          class="login-input"
          size="large"
          placeholder="请输入账号"
          v-model="formLogin.user_name"
        />
      </el-form-item>

      <el-form-item prop="password" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
        <el-input
          class="login-input"
          size="large"
          type="password"
          placeholder="请输入密码"
          v-model="formLogin.password"
          show-password
        />
      </el-form-item>

      <el-form-item prop="auth_code" :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]">
        <div class="form-row form-code">
          <el-input
            class="login-input"
            size="large"
            placeholder="请输入验证码"
            v-model="formLogin.auth_code"
          />
          <div class="code-img">
            <img
              class="login_auth_pic"
              :src="captchaUrl"
              style="width: 100%; height: 100%"
              @click="refreshCaptcha"
            />
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button class="throttle" size="large" type="primary" native-type="submit" :loading="loginLoading">
          登 录
        </el-button>
        <a
          v-if="systemInfo?.integrateLink"
          target="_blank"
          rel="noopener noreferrer"
          :href="systemInfo.integrateLink"
        >接入指南</a>
      </el-form-item>
    </el-form>
  </div>
  <div class="login-footer">
    {{ systemInfo?.copyright }}
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserService, SystemService } from '@/service/api';
import { SystemInfo } from '@/types/type-system';
import JSEncrypt from 'jsencrypt';
import { setLoginSession } from '@u/auth-session';
import { getAssetUrl, withCacheBuster, withBaseUrl } from '@u/url';
import loginBanner from '@a/images/login_banner.png';

interface IFromLogin {
  user_name: string;
  password: string;
  auth_code: string;
}

export default defineComponent({
  name: 'ampLogin',
  setup() {
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
      return `${withCacheBuster(withBaseUrl('/api/v1/system/login/kaptcha'))}&_=${timestamp.value}`;
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
        
        setLoginSession(loginRes);
        
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

    const getLogoUrl = () => {
      if (!systemInfo.value?.systemLogo) return '';
      const url = systemInfo.value.systemLogo;
      return getAssetUrl(url);
    };

    const getBannerStyle = () => {
      if (!systemInfo.value?.systemBanner) {
        return { background: `url(${loginBanner})` };
      }
      const url = systemInfo.value.systemBanner;
      const bannerUrl = getAssetUrl(url);
      return { background: `url(${bannerUrl})` };
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
      refreshCaptcha,
      getLogoUrl,
      getBannerStyle,
    };
  },
});
</script>

<style lang="less" scoped>
.login-background {
  width: 100vw;
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
      white-space: pre-line;
    }
  }
}

.throttle {
  box-sizing: border-box;
  font-size: 14px;
  background: #3988ff;
  color: #fff;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  border: none;
  height: 40px;
  line-height: 40px;
  width: 100%;
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

  :deep(.el-form) {
    width: 100%;
    margin-bottom: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item .el-form-item__label) {
    display: none;
  }

  :deep(.el-form-item .el-form-item__content) {
    margin-left: 0;
  }

  .login-logo-title {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 20px;
    padding-bottom: 40px;
    .logo {
      width: 50px;
      height: 50px;
      background: url('@a/images/icon-logo.png');
      background-size: cover;
      background-repeat: no-repeat;
    }
    .title {
      margin-left: 20px;
      font-size: 18px;
      font-weight: bold;
    }
  }
  .login-input {
    outline: none;
    font-size: 14px;
    transition: 0.3s;
    box-sizing: border-box;
    :deep(.el-input__wrapper) {
      border: 1px solid #aeb7c9;
      border-radius: 4px;
      height: 40px;
      box-shadow: none;
      :hover {
        border-color: #3988ff;
      }
      :focus-within {
        border-color: #3988ff;
        box-shadow: 0 0 0 2px rgba(57, 136, 255, 0.1);
      }
    }
    :deep(.el-input__inner) {
      font-size: 14px;
      line-height: 1.5;
      height: 28px;
    }
  }
  .form-row {
    display: flex;
    align-items: center;
    width: 100%;

    :deep(.el-input) {
      flex: 3;
    }

    .code-img {
      flex: 1;
      height: 40px;
      margin-left: 10px;
    }
    .login_auth_pic {
      height: 40px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }

    .form-btn {
      flex-shrink: 0;
    }
  }
  .icon {
    font-size: 12px;
  }
  .form-code {
    :deep(.el-input__wrapper) {
      width: 150px;
    }
  }
}
</style>
