<template>
  <div class="main-content device-div">
    <DatetimeFilter class="time-filter" @on-change="onTimeChange"/>
    <Tabs :activeKey="activeKey" :tabsList="tabsList" @on-change="onTabsChange"/>
    <div v-if="activeKey == 'data-msg'">
      <MsgTag :queryParams="queryParams"/>
      <el-divider class="divider-style">数据趋势</el-divider>
      <MsgTrend :queryParams="queryParams" />
      <el-divider class="divider-style">数据列表</el-divider>
      <MsgList :queryParams="queryParams" @on-row-click="onRowClick"/>
      <el-divider class="divider-style" v-if="info && Object.keys(info).length > 0">数据详情</el-divider>
      <MsgDetial :info="info" @on-click="onClickData" v-if="info && Object.keys(info).length > 0" />
      <el-dialog class="json-data-model" width="800px" v-model="visible" title="更多信息" @close="handleOk">
         <json-viewer :value="msgViewData" :expand-depth="1" copyable boxed sort theme="my-json-theme"></json-viewer>
      </el-dialog>
    </div>
    <div v-if="activeKey == 'data-entry'">
      <div v-for="(item, index) in entityList" :key="index">
        <el-divider class="divider-style">{{item.label}}数据列表</el-divider>
        <!-- <EntryList :queryParams="queryParams" :entity="item.name" :delay="index"/> -->
         <div>暂无权限</div>
      </div>
      <el-dialog class="json-data-model" width="800px" v-model="visible" title="数据查看" @close="handleOk">
        <json-viewer :value="msgViewData" :expand-depth="1" copyable boxed sort theme="my-json-theme"></json-viewer>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted} from "vue";
  import { useRouter, useRoute } from 'vue-router';
  import DatetimeFilter from './components/datetime-filter.vue';
  import Tabs from './components/tabs.vue';
  import MsgTag from './components/msg-tag.vue'
  import MsgTrend from './components/msg-trend.vue'
  import MsgList from './components/msg-list.vue'
  import MsgDetial from './components/msg-detail.vue'
  import EntryList from './components/entry-list.vue'
  import { RetrievalService } from '@/service/api';
  import {EntityResponse} from "@/types/type-retrieval";
  
  const router = useRouter();
  const route = useRoute();
  const tabsList = [{
    name: '基础数据',
    value: 'data-msg'
  }, {
    name: '实体数据',
    value: 'data-entry'
  }]
  const queryParams = ref({});
  const activeKey = ref<string>(route.query.active ? route.query.active as string : 'data-msg')
  const visible = ref<boolean>(false)
  const msgViewData = ref<object>({})
  const timeArray = ref<string[]>([])
  // 修改info的初始值，使其可以接收表格行的数据
  const info = ref<object>({})
  interface EntityItem {
    label: string;
    name: string;
  }
  const entityList = ref<EntityItem[]>([])

  onMounted(() => {
    activeKey.value = route.query.active ? route.query.active as string : 'data-msg'
  })
const onTabsChange = (val) => {
  activeKey.value = val
  router.replace({
  query: {
    ...router.currentRoute.value.query, // 获取当前路由的查询参数
    active: activeKey.value, // 添加新的参数 active
  }
  });
  reloadData()
}
const onTimeChange = (val) => {
  timeArray.value = val
  reloadData()
}

// 新增处理表格行点击的方法
const onRowClick = (record: any) => {
  info.value = record;
}

const reloadData = () => {
  if (activeKey.value == 'data-msg') {
    getMsgData()
  } else if(activeKey.value == 'data-entry'){
    getEntryData()
  }
}
const getMsgData = () => {
  queryParams.value = {...route.query, start_time: timeArray.value[0], end_time: timeArray.value[1]}
}
const getEntryData = () => {

  let params = {}
  RetrievalService.getEntity(params).then((res: EntityResponse) => {
      entityList.value = res.entity_list
    })
  queryParams.value = {...route.query, start_time: timeArray.value[0], end_time: timeArray.value[1]}
}

const handleOk = () => {
  visible.value = false
}
const onClickData = (data) => {
  visible.value = true
  // 判断是否是对象类型
  if (typeof data === 'undefined') {
    msgViewData.value = {}
  }else if (typeof data === 'object') {
    msgViewData.value = data
  }else {
    msgViewData.value = JSON.parse(data)
  }
}

</script>

<style lang="scss">
  .device-div{
    position: relative;
    .time-filter{
      position: absolute;
      top: 20px;
      right: 10px;
      z-index: 99;
    }
    .divider-style{
      margin-top: 40px;
      border-top-color: #3988ff;
      .el-divider__text{
        background-color: #3988ff;
        color: #fff;
        border-radius: 10px;
        padding: 0 10px;
      }
    }
  }
</style>