<template>
  <el-tabs v-model="active" @tab-change="changeTabs">
    <el-tab-pane v-for="(item, index) in tabsList" :key="(item as any).value" :label="(item as any).name" :name="(item as any).value"></el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
  import {ref, watch} from "vue";
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
  const changeTabs = (val) => {
    emit('on-change', val);
  }
</script>

<style lang="scss" scoped></style>
