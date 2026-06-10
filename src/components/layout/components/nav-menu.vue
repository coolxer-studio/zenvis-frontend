<template>
  <a-menu v-model:selectedKeys="current" mode="horizontal" class="login-header-nav">
    <template v-for="(item, index) in menuList">
      <a-menu-item v-if="!item.children" :key="item.code" class="menu-item-with-superscript">
        <router-link :to="{name: item.route, params: { menuParams: item.params }}" style="position: relative; display: inline-block;">
          <template #icon>
            <!--<mail-outlined />-->
          </template>
          {{item.name}}
          <sup v-if="item.superscript" class="menu-superscript">{{ item.superscript }}</sup>
        </router-link>
        <div class="nav_triangle"></div>
      </a-menu-item>
      <a-sub-menu v-else :key="item.code" class="menu-item-with-superscript">
        <template #icon>
          <!--<setting-outlined />-->
        </template>
        <template #title>
          <span style="position: relative; display: inline-block;">
            {{item.name}}
            <sup v-if="item.superscript" class="menu-superscript">{{ item.superscript }}</sup>
            <div class="nav_triangle"></div>
          </span>
        </template>
        <a-menu-item v-for="child in item.children" :key="child.code">
          <router-link :to="{name: child.route, params: { menuParams: child.params }}">{{child.name}}</router-link>
        </a-menu-item>
      </a-sub-menu>
    </template>
  </a-menu>
  <a-dropdown class="user-option">
    <a class="ant-dropdown-link" @click.prevent>
      <UserOutlined />
    </a>
    <template #overlay>
      <a-menu>
        <a-menu-item>
          <div style="color: #7c8087"><user-outlined /> {{userInfo.name}}</div>
          <a-divider style="height: 1px; background-color: #d5d7d7;margin: 2px;" />
          <div style="color: #7c8087">{{userInfo.email}}</div>
        </a-menu-item>
        <a-menu-item>
          <a href="javascript:;" @click="updatePassword">修改密码</a>
        </a-menu-item>
        <a-menu-item>
          <a href="javascript:;" @click="logOut"><LogoutOutlined /> 退出</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <Password :show="showPassword" @on-ok="submit" @on-cancel="closeModel" />
</template>
<script setup lang="ts">
  import { ref} from 'vue';
  import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue';
  import { UserService } from '@/service/api/api-user';
  import {ls} from "@u/local-storage";
  import {useRouter} from "vue-router";
  import Password from './nav-password.vue';
  import JSEncrypt from 'jsencrypt'
  import {message, Modal} from "ant-design-vue";
  import {getContainer} from "@/types/type-modal";
  const router = useRouter();
  const menuList = ls.get('__permission__')
  let showPassword = ref<boolean>(false)
  const userInfo = ls.get('__user__')
  const current = ref<string[]>([router.currentRoute.value.name as string]);
  const logOut = () => {
    Modal.confirm({
      title: '提示',
      content: '请确认是否退出登录？',
      cancelText: '取消',
      okText: '确认',
      getContainer,
      onOk() {
        UserService.doLogOut().then((res: any) => {
          ls.clear();
          // window.location.href = '/user/login';
          router.push({
            name: 'login',
          });
        });
      },
    });
  }
  const updatePassword = () => {
    showPassword.value = true
  }
  const submit = (params) => {
    const encryptor = new JSEncrypt()
    UserService.getEncrypyKey().then((res: any) => {
      encryptor.setPublicKey(res.key)
      UserService.editPassword({...params, old_password: encryptor.encrypt(params.old_password), password: encryptor.encrypt(params.password)}).then((res: any) => {
        message.success('修改成功', 2, () => {
          showPassword.value = false
          logOut()
        });
      })
    });
  }
  const closeModel = () => {
    showPassword.value = true
  }
</script>
<style lang="less" scoped>
  .login-header-nav{
    background-color: unset;
    color: #fff;
    font-size: 16px;
  }
  .user-option{
    position: absolute;
    top: 0px;
    right: 20px;
    .anticon{
      font-size: 26px;
      color: #fff;
      margin-left: 10px;
    }
  }
  .menu-superscript {
    position: absolute;
    top: 10px;
    right: -30px;
    color: #fff;
    padding: 0 6px;
    font-size: 12px;
    z-index: 2;
    line-height: 18px;
    min-width: 18px;
    text-align: center;
    pointer-events: none;
    animation: blink 3s infinite;
    text-shadow:
                0 0 5px #ff3100,
                0 0 10px #ff3100,
                0 0 20px #ff3100,
                0 0 40px #ff3100,
                0 0 80px #ff3100,
                0 0 120px #ff3100,
                0 0 200px #ff3100;
                
  }
  @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
</style>
