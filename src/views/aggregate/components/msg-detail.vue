<template>
  <el-row class="device-info" :gutter="0">
    <el-col class="col-style" :span="12">
      <div class="col-l">GUID</div>
      <div class="col-r">{{info.guid}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">启动id</div>
      <div class="col-r">{{info.start_id}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">平台</div>
      <div class="col-r">{{info.platform}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">厂商</div>
      <div class="col-r">{{info.manufacturer}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">型号</div>
      <div class="col-r">{{info.model}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">系统名称</div>
      <div class="col-r">{{info.system_name}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">系统版本</div>
      <div class="col-r">{{info.system_version}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">数据类型</div>
      <div class="col-r">{{info.fact_type}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">标记</div>
      <div class="col-r">{{info.agenda_tags}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">处置</div>
      <div class="col-r">{{info.punish_types}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">网络类型</div>
      <div class="col-r">{{info.net_type}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">内网ip</div>
      <div class="col-r">{{info.lan_ip}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">外网ip</div>
      <div class="col-r">{{info.wan_ip}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">sdk版本</div>
      <div class="col-r">{{info.sdk_version}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">应用名称</div>
      <div class="col-r">{{info.app_name}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">应用版本</div>
      <div class="col-r">{{info.app_version}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">应用id</div>
      <div class="col-r">{{info.app_id}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">应用标识</div>
      <div class="col-r">{{info.app_package}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">用户id</div>
      <div class="col-r">{{info.user_id}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">经度</div>
      <div class="col-r">{{info.latitude}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">纬度</div>
      <div class="col-r">{{info.longitude}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">国家</div>
      <div class="col-r">{{info.country}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">省份</div>
      <div class="col-r">{{info.province}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">区市</div>
      <div class="col-r">{{info.city}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">县区</div>
      <div class="col-r">{{info.county}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">街道</div>
      <div class="col-r">{{info.thoroughfare}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">规则id</div>
      <div class="col-r">{{info.rule}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">采集时间</div>
      <div class="col-r">{{info.client_time}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">接收时间</div>
      <div class="col-r">{{info.server_time}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">入库时间</div>
      <div class="col-r">{{info.insert_time}}</div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">数据详情</div>
      <div class="col-r">
         <img class="json-svg" src="/src/assets/svg-icon/json.svg" @click="showData(info.fact)" alt="">
      </div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">标记详情</div>
      <div class="col-r">
         <img class="json-svg" src="/src/assets/svg-icon/json.svg" @click="showData(info.agendas)" alt="">
      </div>
    </el-col>
    <el-col class="col-style" :span="12">
      <div class="col-l">处置详情</div>
      <div class="col-r">
         <img class="json-svg" src="/src/assets/svg-icon/json.svg" @click="showData(info.punish)" alt="">
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
  defineProps({
    info: {
      type: Object,
      default: () => {
        return {}
      }
    }
  });
  const emit = defineEmits({
    'on-click': null,
  });
  const showData = (val) => {
    emit('on-click', val);
  }
</script>

<style lang="scss" scoped>
  .device-info{
    color: #7c8087;
    border-top: 1px solid #beceec;
    border-left: 1px solid #beceec;
    .col-style{
      border-right: 1px solid #beceec;
      border-bottom: 1px solid #beceec;
      height: 30px;
      line-height: 30px;
    }
    .col-l{
      width: 40%;
      display: inline-block;
      font-weight: bold;
      padding-left: 10px;
      background-color: #eceff6;
      height: 29px;
    }
    .col-r{
      width: 60%;
      display: inline-block;
      padding-left: 10px;
    }
  }
</style>
