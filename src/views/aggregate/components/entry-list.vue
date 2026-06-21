<template>
  <el-table
    :data="tableState.data"
    :scrollbar-always-on="true"
    border
    style="width: 100%"
    v-loading="tableState.loading"
    @sort-change="change"
    :row-class-name="getRowClassName"
    @row-click="handleRowClick"
  >
    <el-table-column
      v-for="column in tableState.sourceColumns"
      :key="column.dataIndex"
      :prop="column.dataIndex"
      :label="column.title"
      :width="column.width"
      :min-width="column.minWidth"
      :fixed="column.fixed"
      :sortable="column.sortable"
      :show-overflow-tooltip="column.ellipsis"
    >
      <template #default="{ row, column: col }">
        <template v-if="col.property === 'data'">
          <el-tooltip content="数据查看" placement="top">
            <img class="json-svg" src="/src/assets/svg-icon/json.svg" @click.stop="showData(row.data)" alt="">
          </el-tooltip>
        </template>
        <template v-else>
          {{ row[col.property] }}
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from "vue";
import { TDynamicTableParams, TPagination, TTable } from "@/types/type-public";
import { TDeviceListResponse } from "@/types/type-device";
import { merge, omit } from "lodash";
import { AggregateService } from '@/service/api';
import { ElMessage } from 'element-plus';

// 时间格式转换函数：将 'YYYY-MM-DD HH:mm:ss' 格式转换为时间戳
const formatDateToTimestamp = (dateStr: string): number | null => {
  if (!dateStr) return null;
  // 尝试解析标准时间格式
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date format:', dateStr);
    return null;
  }
  return Math.floor(date.getTime() / 1000); // 转换为秒级时间戳
};

// 定义消息列表API响应类型
interface MsgListResponse {
  rows: TDeviceListResponse[];
  total: number;
  [key: string]: any; // 允许其他可能的属性
}

const props = withDefaults(defineProps<{
  queryParams?: {
    start_time?: string;  // 蛇形命名，标准时间格式如 '2026-01-10 00:00:00'
    end_time?: string;    // 蛇形命名，标准时间格式如 '2026-01-10 00:00:00'
  };
  entity?: string;
  delay?: number;
  state?: ITableState;
  scroll?: number;
}>(), {
  queryParams: () => ({
    start_time: '',
    end_time: '',
  }),
  entity: '',
  delay: 0,
  scroll: 0,
});

type ITableState = TTable<TDeviceListResponse> & {
  loading: boolean;
} & TDynamicTableParams;

const tableState: ITableState = reactive<ITableState>({
  loading: false,
  sourceColumns: [
    {
      title: 'GUID',
      dataIndex: 'guid',
      ellipsis: true,
      resizable: true,
      width: 320,
      display_selected: true
    },
    {
      title: '启动id',
      dataIndex: 'start_id',
      resizable: true,
      width: 170,
      display_selected: true
    },
    {
      title: '平台',
      dataIndex: 'platform',
      ellipsis: true,
      resizable: true,
      width: 60,
      display_selected: false
    },
    {
      title: '厂商',
      dataIndex: 'manufacturer',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '型号',
      dataIndex: 'model',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '系统名称',
      dataIndex: 'system_name',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '系统版本',
      dataIndex: 'system_version',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '数据类型',
      dataIndex: 'fact_type',
      ellipsis: true,
      resizable: true,
      width: 150,
      display_selected: true
    },
    {
      title: '标记',
      dataIndex: 'agenda_tags',
      ellipsis: true,
      resizable: true,
      width: 200,
      display_selected: true
    },
    {
      title: '处置',
      dataIndex: 'punish_types',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '网络类型',
      dataIndex: 'net_type',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '内网ip',
      dataIndex: 'lan_ip',
      ellipsis: true,
      resizable: true,
      width: 120,
      display_selected: false
    },
    {
      title: '外网ip',
      dataIndex: 'wan_ip',
      ellipsis: true,
      resizable: true,
      width: 120,
      display_selected: true
    },
    {
      title: 'sdk版本',
      dataIndex: 'sdk_version',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '应用名称',
      dataIndex: 'app_name',
      ellipsis: true,
      resizable: true,
      width: 120,
      display_selected: true
    },
    {
      title: '应用版本',
      dataIndex: 'app_version',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '应用id',
      dataIndex: 'app_id',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '应用标识',
      dataIndex: 'app_package',
      ellipsis: true,
      resizable: true,
      width: 120,
      display_selected: false
    },
    {
      title: '用户id',
      dataIndex: 'user_id',
      ellipsis: true,
      resizable: true,
      width: 120,
      display_selected: false
    },
    {
      title: '经度',
      dataIndex: 'latitude',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '纬度',
      dataIndex: 'longitude',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '国家',
      dataIndex: 'country',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '省份',
      dataIndex: 'province',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '区市',
      dataIndex: 'city',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '县区',
      dataIndex: 'county',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '街道',
      dataIndex: 'thoroughfare',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: true
    },
    {
      title: '规则id',
      dataIndex: 'rule',
      ellipsis: true,
      resizable: true,
      width: 100,
      display_selected: false
    },
    {
      title: '采集时间',
      dataIndex: 'client_time',
      ellipsis: true,
      resizable: true,
      width: 150,
      display_selected: true
    },
    {
      title: '接收时间',
      dataIndex: 'server_time',
      ellipsis: true,
      resizable: true,
      width: 150,
      display_selected: false
    },
    {
      title: '入库时间',
      dataIndex: 'insert_time',
      ellipsis: true,
      resizable: true,
      width: 150,
      display_selected: false
    },
  ],
  disabledTitles: [],
  selectedCol: [],
  columns: [],
  data: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total: number) =>
      `共 ${total} 条记录 第${tableState.pagination.current}/${Math.ceil(
        tableState.pagination.total / tableState.pagination.pageSize,
      )}页`,
    showQuickJumper: true,
  },
});

// 添加选中行的状态 - 使用行索引作为唯一标识
const selectedRowIndex = ref<number | null>(null);

// 添加isLoading状态变量防止重复请求
const isLoading = ref(false);

const emit = defineEmits<{
  'on-change': [pagination: TPagination]
  'on-click': [data: any]
  'on-resize': [width: number, column: any]
  'on-row-click': [record: any]  // 新增事件用于传递点击行的数据
}>();

const handleResizeColumn = (w: number, col: any) => {
  col.width = w;
};

const change = (pagination: TPagination): void => {
  emit('on-change', pagination);
  merge(tableState.pagination, pagination);
  getData();
};

const showData = (val: any) => {
  emit('on-click', val);
};

// 新增处理表格行点击的方法
const handleRowClick = (row: any, column: any, event: Event) => {
  // 找到当前行的索引
  const index = tableState.data.findIndex(item => item === row);
  // 设置选中的行索引
  selectedRowIndex.value = index;
  emit('on-row-click', row);
};

// 获取行的CSS类名
const getRowClassName = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  let className = rowIndex % 2 === 0 ? '' : 'table-striped';
  // 如果当前行是选中的行，添加选中样式
  if (selectedRowIndex.value === rowIndex) {
    className += ' table-row-selected';
  }
  return className;
};

// 获取列表数据
const getData = async () => {
  // 检查是否正在加载，避免重复请求
  if (isLoading.value) {
    return;
  }
  
  isLoading.value = true;
  tableState.loading = true;
  try {
    // 构建基础参数
    const baseParams = {
      perPage: tableState.pagination.pageSize,
      page: tableState.pagination.current,
      entity_name: props.entity || undefined,
    };
    
    // 构建完整参数对象
    let params: Record<string, any> = { ...props.queryParams,...baseParams };
    // params移除start_time和end_time参数
    params = omit(params, ['start_time', 'end_time']);

    // 构建insertTime参数（仅在有有效时间参数时添加）
    const startTimeTimestamp = formatDateToTimestamp(props.queryParams.start_time || '');
    const endTimeTimestamp = formatDateToTimestamp(props.queryParams.end_time || '');
    
    // TODO 接口暂不支持这个参数，后续支持再放开
    // if (startTimeTimestamp !== null && endTimeTimestamp !== null) {
    //   params.insertTime = `${startTimeTimestamp},${endTimeTimestamp}`;
    // }
    // 如果没有有效的时间参数，则不添加insertTime参数
    
    // 添加基于索引的延时（索引值 * 1000 毫秒）
    await new Promise(resolve => setTimeout(resolve, (props.delay || 0) * 1000));
    
    const data = await AggregateService.getEntryList(params) as MsgListResponse;
    tableState.data = data.rows || [];
    tableState.pagination.total = data.total || 0;
  } catch (error) {
    console.error('获取消息列表失败:', error);
    ElMessage.error('获取数据失败，请稍后重试');
    tableState.data = [];
    tableState.pagination.total = 0;
  } finally {
    tableState.loading = false;
    isLoading.value = false;
  }
};

// 监听时间范围变化
watch(
  () => props.queryParams,
  (newValue) => {
    if (newValue) {
      // 重置分页到第一页
      tableState.pagination.current = 1;
      getData();
    }
  },
  {
    deep: true,
  },
);

onMounted(() => {
  // 判断props.queryParams有参数
  if(Object.keys(props.queryParams).length > 0){
    getData();
  }
});
</script>

<style lang="scss" scoped>
.table-striped {
  background-color: #f9f9f9;
}
/* 使用深度选择器确保样式能够穿透到Element Plus组件内部 */
:deep(.el-table__body tr.table-row-selected) {
  background-color: #bae7ff !important;
  border-left: 3px solid #1890ff !important;
  
  & > td {
    background-color: #bae7ff !important;
  }
}
/* 针对hover状态也保持选中样式 */
:deep(.el-table__body tr.table-row-selected:hover) {
  background-color: #e6f7ff !important;
  
  & > td {
    background-color: #e6f7ff !important;
  }
}
.json-svg {
  cursor: pointer;
  width: 16px;
  height: 16px;
}
</style>