<template>
  <a-config-provider :locale="locale">
    <router-view></router-view>
  </a-config-provider>
</template>

<script lang="ts">
import locale from 'ant-design-vue/lib/locale-provider/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export default {
  name: 'RootApp',
  setup() {
    return { locale };
  },
};
</script>

<style lang="scss"></style>
