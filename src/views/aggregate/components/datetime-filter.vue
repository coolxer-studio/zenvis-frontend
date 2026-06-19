<template>
  <el-config-provider :locale="zhCn">
    <el-date-picker
      v-model="timeValue"
      style="width: 400px"
      :disabled-date="disabledDate"
      type="datetimerange"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
      @change="changeTime"
    />
  </el-config-provider>
</template>

<script setup lang="ts">
  import {onMounted, ref, watch} from "vue";
  import { ElConfigProvider } from 'element-plus';
  import zhCn from 'element-plus/es/locale/lang/zh-cn';
  const props = defineProps({
    activeKey: {
      type: String,
      default: () => {
        return 'dev'
      }
    },
    tabsList: {
      type: Array,
      default: () => {
        return []
      }
    }
  });
  const timeValue = ref<[Date, Date]>([new Date(
    new Date(new Date().toLocaleDateString()).getTime()
  ), new Date(
    new Date(new Date().toLocaleDateString()).getTime() +
    24 * 60 * 60 * 1000 -
    1
  )])
  const disabledDate = (time: Date) => {
    // Can not select days before today and today
    return time.getTime() >= new Date().setHours(23, 59, 59, 999);
  };
  const active = ref<string>('')
  watch(
    () => props.activeKey,
    (newVal, oldVal) => {
      active.value = newVal
    },
    {
      deep: true,
      immediate: true
    }
  )
  const emit = defineEmits({
    'on-change': null,
  });
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const changeTime = (val) => {
    emit('on-change', [formatDate(val[0]), formatDate(val[1])]);
  }
  onMounted(() => {
    emit('on-change', [formatDate(timeValue.value[0]), formatDate(timeValue.value[1])]);
  })
</script>

<style lang="scss" scoped></style>
