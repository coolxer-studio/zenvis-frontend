<template>
  <table class="tag-table">
    <tr v-for="item in tags">
      <td class="td-l">{{item.type}}</td>
      <td class="td-r">
        <el-tag v-for="(item1, index) in item.value_list" :key="index" :type="getTagType(index)">{{item1}}</el-tag>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { AggregateService } from '@/service/api';

const tagTypes = ['primary', 'success', 'info', 'warning', 'danger'];

const getTagType = (index: number): string => {
  return tagTypes[index % tagTypes.length];
};

const props = defineProps({
  queryParams: {
    type: Object,
    default: () => {
      return {
        startTime: '',
        endTime: '',
      };
    },
  },
});

const tags = ref([]);
// 添加isLoading状态变量防止重复请求
const isLoading = ref(false);

const getData = (params) => {
  // 检查是否正在加载，避免重复请求
  if (isLoading.value) {
    return;
  }
  
  isLoading.value = true;
  AggregateService.getMsgTag(params)
    .then(data => {
      tags.value = data.tags
    })
    .catch(error => {
      console.error('标签数据失败:', error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 监听时间范围变化
watch(
  () => props.queryParams,
  (newValue) => {
    getData(newValue);
  },
  {
    deep: true,
  },
);

onMounted(() => {
  // 判断props.queryParams有参数
  if(Object.keys(props.queryParams).length > 0){
    getData(props.queryParams);
  }
});

</script>

<style lang="scss" scoped>
  .tag-table{
    width: 100%;
    border-top: 1px solid #beceec;
    border-left: 1px solid #beceec;
    tr td {
      line-height: 40px;
      border-bottom: 1px solid #beceec;
      border-right: 1px solid #beceec;
    }
    .td-l{
      text-align: center;
    }
    .td-r{
      padding-left: 10px;
    }
  }
</style>
