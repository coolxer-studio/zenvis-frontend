<template>
  <div class="login-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <section class="brand-panel" :style="bannerStyle">
      <div class="brand-overlay"></div>
      <div class="brand-content">
        <div class="product-chip">
          <span class="status-dot"></span>
          Intelligent Security Operations
        </div>
        <h1>{{ systemInfo?.productName || systemInfo?.systemTitle || 'ZenVis' }}</h1>
        <p>
          {{
            systemInfo?.productIntroduction ||
            '连接资产、威胁、脆弱性与智能 Agent，让复杂安全运营变得清晰、可控。'
          }}
        </p>
        <div class="feature-grid">
          <div class="feature-item">
            <span class="feature-icon">01</span>
            <div><strong>统一态势</strong><small>跨域数据实时汇聚</small></div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">02</span>
            <div><strong>智能协同</strong><small>Agent 驱动调查处置</small></div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">03</span>
            <div><strong>闭环运营</strong><small>从发现到复核可追踪</small></div>
          </div>
        </div>
      </div>
      <div class="brand-footer">
        <span><i></i> 服务状态正常</span>
        <span>安全连接 · 数据加密</span>
      </div>
    </section>

    <section class="auth-panel">
      <n-card class="login-card" :bordered="false">
        <div class="login-brand">
          <img v-if="systemInfo?.systemLogo" :src="logoUrl" class="login-logo" alt="系统标识" />
          <span v-else class="login-logo-fallback"><span></span></span>
          <div>
            <strong>{{ systemInfo?.systemTitle || 'ZenVis' }}</strong>
            <small>SECURITY OPERATIONS CENTER</small>
          </div>
        </div>

        <div class="login-heading">
          <span>欢迎回来</span>
          <h2>登录安全运营平台</h2>
          <p>使用管理员或已授权平台账号继续</p>
        </div>

        <n-form ref="formRef" :model="formLogin" :rules="formRules" size="large" @submit.prevent="onFinish">
          <n-form-item path="user_name" label="账号">
            <n-input v-model:value="formLogin.user_name" placeholder="请输入账号" clearable>
              <template #prefix><n-icon><User /></n-icon></template>
            </n-input>
          </n-form-item>

          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="formLogin.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
              @keyup.enter="onFinish"
            >
              <template #prefix><n-icon><Lock /></n-icon></template>
            </n-input>
          </n-form-item>

          <n-form-item path="auth_code" label="验证码">
            <div class="captcha-row">
              <n-input
                v-model:value="formLogin.auth_code"
                placeholder="输入图中字符"
                maxlength="12"
                @keyup.enter="onFinish"
              >
                <template #prefix><n-icon><Key /></n-icon></template>
              </n-input>
              <button class="captcha-button" type="button" title="点击刷新验证码" @click="refreshCaptcha">
                <img :src="captchaUrl" alt="验证码" />
                <span>换一张</span>
              </button>
            </div>
          </n-form-item>

          <n-button type="primary" block size="large" :loading="loginLoading" @click="onFinish">
            登录平台
          </n-button>
        </n-form>

        <div class="login-support">
          <span>登录即代表你同意遵守组织安全策略</span>
          <a
            v-if="systemInfo?.integrateLink"
            :href="systemInfo.integrateLink"
            target="_blank"
            rel="noopener noreferrer"
          >接入指南</a>
        </div>
      </n-card>

      <footer>{{ systemInfo?.copyright || '© ZenVis Security Operations' }}</footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCard, NForm, NFormItem, NIcon, NInput, type FormInst, type FormRules } from 'naive-ui';
import { Key, Lock, User } from '@element-plus/icons-vue';
import JSEncrypt from 'jsencrypt';

import { SystemService, UserService } from '@/service/api';
import type { SystemInfo } from '@/types/type-system';
import { setLoginSession } from '@u/auth-session';
import { getAssetUrl, withBaseUrl, withCacheBuster } from '@u/url';
import loginBanner from '@a/images/login_banner.png';

defineOptions({ name: 'ModernLogin' });

type LoginForm = {
  user_name: string;
  password: string;
  auth_code: string;
};

const router = useRouter();
const formRef = ref<FormInst>();
const loginLoading = ref(false);
const timestamp = ref(Date.now());
const systemInfo = ref<SystemInfo>();
const formLogin = reactive<LoginForm>({ user_name: '', password: '', auth_code: '' });
const formRules: FormRules = {
  user_name: [{ required: true, message: '请输入账号', trigger: ['blur', 'input'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['blur', 'input'] }],
  auth_code: [{ required: true, message: '请输入验证码', trigger: ['blur', 'input'] }],
};

const captchaUrl = computed(
  () => `${withCacheBuster(withBaseUrl('/api/v1/system/login/kaptcha'))}&_=${timestamp.value}`,
);
const logoUrl = computed(() => (systemInfo.value?.systemLogo ? getAssetUrl(systemInfo.value.systemLogo) : ''));
const bannerStyle = computed(() => ({
  '--login-banner': `url(${systemInfo.value?.systemBanner ? getAssetUrl(systemInfo.value.systemBanner) : loginBanner})`,
}));

const refreshCaptcha = () => {
  timestamp.value = Date.now();
};

const onFinish = async () => {
  try {
    await formRef.value?.validate();
    loginLoading.value = true;
    const encryptor = new JSEncrypt();
    const keyResponse = await UserService.getEncrypyKey();
    encryptor.setPublicKey(keyResponse.key);
    const loginResponse = await UserService.doLogin({
      ...formLogin,
      password: encryptor.encrypt(formLogin.password) || '',
    });
    setLoginSession(loginResponse);
    await router.push({ name: 'dashboard' });
  } catch (error: any) {
    if (error?.code === 102) refreshCaptcha();
  } finally {
    loginLoading.value = false;
  }
};

const loadSystemInfo = async () => {
  try {
    systemInfo.value = await SystemService.getSystemInfo();
  } catch (error) {
    console.error('获取系统信息失败:', error);
  }
};

onMounted(() => {
  loadSystemInfo();
  refreshCaptcha();
});
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  grid-template-columns: minmax(480px, 1.15fr) minmax(440px, 0.85fr);
  background: var(--zv-bg);
}

.ambient {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(2px);
}

.ambient-one {
  top: -14vw;
  right: -10vw;
  width: 32vw;
  height: 32vw;
  background: radial-gradient(circle, rgba(79, 110, 247, 0.13), transparent 68%);
}

.ambient-two {
  bottom: -15vw;
  left: 34%;
  width: 34vw;
  height: 34vw;
  background: radial-gradient(circle, rgba(34, 184, 207, 0.09), transparent 70%);
}

.brand-panel {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  padding: clamp(44px, 6vw, 88px);
  color: #fff;
  flex-direction: column;
  justify-content: center;
  background:
    linear-gradient(145deg, rgba(7, 16, 39, 0.96), rgba(24, 42, 92, 0.88)),
    var(--login-banner) center / cover;
}

.brand-panel::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgba(128, 150, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(128, 150, 255, 0.055) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom right, #000, transparent 85%);
}

.brand-overlay {
  position: absolute;
  top: 12%;
  right: 2%;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(34, 184, 207, 0.18), transparent 68%);
  border: 1px solid rgba(128, 150, 255, 0.16);
  border-radius: 50%;
  box-shadow: inset 0 0 80px rgba(79, 110, 247, 0.08);
}

.brand-content,
.brand-footer {
  position: relative;
  z-index: 2;
}

.product-chip {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  height: 32px;
  padding-inline: 13px;
  color: #dce8ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 7px;
  height: 7px;
  margin-right: 8px;
  background: #32d69b;
  border-radius: 50%;
  box-shadow: 0 0 12px #32d69b;
}

.brand-content h1 {
  max-width: 720px;
  margin: 28px 0 18px;
  font-size: clamp(42px, 5vw, 72px);
  font-weight: 760;
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.brand-content > p {
  max-width: 650px;
  color: rgba(230, 239, 255, 0.74);
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.8;
  white-space: pre-line;
}

.feature-grid {
  display: grid;
  max-width: 710px;
  margin-top: 46px;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.feature-item {
  display: flex;
  min-width: 0;
  padding: 15px;
  align-items: center;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 15px;
  backdrop-filter: blur(12px);
  transition: transform 200ms var(--zv-motion), background-color 200ms ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateY(-3px);
}

.feature-icon {
  display: grid;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  color: #aebcff;
  font-size: 11px;
  font-weight: 800;
  place-items: center;
  background: rgba(128, 150, 255, 0.12);
  border-radius: 10px;
}

.feature-item > div {
  display: flex;
  min-width: 0;
  margin-left: 10px;
  flex-direction: column;
}

.feature-item strong {
  font-size: 13px;
}

.feature-item small {
  margin-top: 3px;
  overflow: hidden;
  color: rgba(230, 239, 255, 0.52);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-footer {
  position: absolute;
  right: clamp(36px, 5vw, 76px);
  bottom: 30px;
  left: clamp(36px, 5vw, 76px);
  display: flex;
  color: rgba(230, 239, 255, 0.46);
  font-size: 11px;
  justify-content: space-between;
}

.brand-footer span:first-child {
  display: inline-flex;
  align-items: center;
}

.brand-footer i {
  width: 6px;
  height: 6px;
  margin-right: 7px;
  background: #32d69b;
  border-radius: 50%;
}

.auth-panel {
  position: relative;
  z-index: 2;
  display: flex;
  min-width: 0;
  min-height: 100vh;
  padding: 48px clamp(30px, 5vw, 86px) 28px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.login-card {
  width: min(100%, 456px);
  padding: 10px 8px;
  background: color-mix(in srgb, var(--zv-bg-elevated) 92%, transparent);
  box-shadow: var(--zv-shadow-lg);
  backdrop-filter: blur(18px);
}

.login-brand {
  display: flex;
  align-items: center;
}

.login-logo,
.login-logo-fallback {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 14px;
}

.login-logo-fallback {
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, var(--zv-primary), var(--zv-cyan));
  box-shadow: 0 10px 24px rgba(79, 110, 247, 0.25);
}

.login-logo-fallback span {
  width: 12px;
  height: 12px;
  border: 3px solid #fff;
  border-radius: 50%;
}

.login-brand > div {
  display: flex;
  margin-left: 12px;
  flex-direction: column;
}

.login-brand strong {
  color: var(--zv-text);
  font-size: 18px;
  font-weight: 760;
}

.login-brand small {
  margin-top: 3px;
  color: var(--zv-text-muted);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.13em;
}

.login-heading {
  margin: 42px 0 28px;
}

.login-heading > span {
  color: var(--zv-primary);
  font-size: 12px;
  font-weight: 700;
}

.login-heading h2 {
  margin: 8px 0 7px;
  color: var(--zv-text);
  font-size: 28px;
  font-weight: 760;
  letter-spacing: -0.03em;
}

.login-heading p,
.login-support {
  color: var(--zv-text-muted);
  font-size: 12px;
}

.captcha-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 126px;
  gap: 10px;
}

.captcha-button {
  position: relative;
  height: 40px;
  overflow: hidden;
  padding: 0;
  background: var(--zv-bg-subtle);
  border: 1px solid var(--zv-border);
  border-radius: 10px;
  cursor: pointer;
}

.captcha-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-button span {
  position: absolute;
  inset: auto 4px 3px auto;
  padding: 1px 5px;
  color: #fff;
  font-size: 9px;
  background: rgba(11, 17, 32, 0.62);
  border-radius: 5px;
  opacity: 0;
  transition: opacity 160ms ease;
}

.captcha-button:hover span {
  opacity: 1;
}

.login-support {
  display: flex;
  margin-top: 22px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.login-support a {
  flex: 0 0 auto;
  color: var(--zv-primary);
  font-weight: 650;
  text-decoration: none;
}

.auth-panel footer {
  position: absolute;
  bottom: 22px;
  color: var(--zv-text-muted);
  font-size: 11px;
}

@media (max-width: 980px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    display: none;
  }

  .auth-panel {
    padding-inline: 24px;
  }
}

@media (max-width: 520px) {
  .auth-panel {
    justify-content: flex-start;
    padding-top: 28px;
  }

  .login-card {
    box-shadow: none;
  }

  .login-heading {
    margin-top: 32px;
  }

  .captcha-row {
    grid-template-columns: 1fr 112px;
  }
}
</style>
