<template>
  <div ref="chartContainerRef" class="view-location"></div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { init } from 'echarts';
import { HomeService } from '@/service/api';

const props = defineProps({
  timeObject: {
    type: Object,
    default: () => {
      return {
        startTime: '',
        endTime: '',
      };
    },
  },
});

const deviceStatData = ref({
  xaxis: [],
  yaxis_name: [],
  yaxis_data: [],
});

const chartContainerRef = ref(null);
let chartInstance = null;

const setData = () => {
  if (!chartInstance) return;
  
  const seriesData = deviceStatData.value.yaxis_name.map((name, index) => ({
    name,
    type: 'bar',
    stack: 'total',
    emphasis: {
      focus: 'series',
    },
    data: deviceStatData.value.yaxis_data[index],
  }));
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      top: 10,
      right: 20,
      color: '#fff',
    },
    grid: {
      top: 60,
      left: 30,
      right: 20,
      bottom: 10,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#fff',
      },
    },
    yAxis: {
      type: 'category',
      data: deviceStatData.value.xaxis,
      axisLabel: {
        color: '#fff',
      },
    },
    series: seriesData,
  };
  
  chartInstance.setOption(option, true);
};

const getData = (params) => {
  HomeService.getLocationStat(params)
    .then(data => {
      deviceStatData.value.xaxis = data.xaxis || [];
      deviceStatData.value.yaxis_name = data.yaxis_name || [];
      deviceStatData.value.yaxis_data = data.yaxis_data || [];
      
      // 初始化图表实例
      if (!chartInstance && chartContainerRef.value) {
        chartInstance = init(chartContainerRef.value);
      }
      
      setData();
    })
    .catch(error => {
      console.error('获取位置统计数据失败:', error);
    });
};

// 监听时间范围变化
watch(
  () => props.timeObject,
  (newValue) => {
    getData(newValue);
  },
  {
    deep: true,
  },
);

// 组件卸载前清理资源
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style lang="scss">
.view-location {
  background-color: rgba(0, 0, 0, 0);
  width: 100%;
  height: 100%;
  
  // 添加响应式支持
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
}
</style>
