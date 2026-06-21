<template>
  <div ref="chartContainerRef" class="view-type"></div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount,onMounted } from 'vue';
import { init } from 'echarts';
import { AggregateService } from '@/service/api';

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

const msgTrendData = ref({
  xaxis: [],
  yaxis_name: [],
  yaxis_data: [],
});

const chartContainerRef = ref(null);
let chartInstance2 = null;

const setData = () => {
  if (!chartInstance2) return;
  
  const seriesData = msgTrendData.value.yaxis_name.map((name, index) => ({
    name: name,
    type: 'line',
    stack: 'Total',
    areaStyle: {},
    emphasis: {
      focus: 'series',
    },
    data: msgTrendData.value.yaxis_data[index],
  }));

  const option = {
    title: {
      text: '数据分布趋势图',
      top: 10,
      color: '#000',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: msgTrendData.value.yaxis_name,
      top: 10,
      right: 20,
      color: '#000',
    },
    grid: {
      top: 60,
      left: 20,
      right: 20,
      bottom: 0,
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: msgTrendData.value.xaxis,
        axisLabel: {
          color: '#000',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: '#000',
        },
      },
    ],
    series: seriesData,
  };
  
  chartInstance2.setOption(option, true);
};

const getData = (params) => {

  // 等待2秒
  setTimeout(() => {
    AggregateService.getMsgTrend(params)
    .then(data => {
      msgTrendData.value.xaxis = data.xaxis || [];
      msgTrendData.value.yaxis_name = data.yaxis_name || [];
      msgTrendData.value.yaxis_data = data.yaxis_data || [];
      
      // 初始化图表实例
      if (!chartInstance2 && chartContainerRef.value) {
        chartInstance2 = init(chartContainerRef.value);
      }
      
      setData();
    })
    .catch(error => {
      console.error('获取消息趋势数据失败:', error);
    });
  }, 1000);
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

// 组件卸载前清理资源
onBeforeUnmount(() => {
  if (chartInstance2) {
    chartInstance2.dispose();
    chartInstance2 = null;
  }
});

onMounted(() => {
  // 判断props.queryParams有参数
  if(Object.keys(props.queryParams).length > 0){
    getData(props.queryParams);
  }
});
</script>

<style lang="scss">
.view-type {
  width: 100%;
  height: 260px;
  
  // 添加响应式支持
  @media (max-width: 768px) {
    height: 220px;
  }
  
  @media (max-width: 480px) {
    height: 200px;
  }
}
</style>
