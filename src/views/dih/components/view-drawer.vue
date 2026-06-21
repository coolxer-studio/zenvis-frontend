<template>
  <!-- 自定义下拉抽屉 -->
  <div class="drawer-container">
    <div class="drawer-header">
      <span>数智中心-整体概览</span>
      <el-button type="primary" link @click="closeDrawer">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
    <div class="drawer-content">
      <div class="overview-container">
        <!-- 系统状态区 -->
        <el-row :gutter="20">
          <el-col v-for="(status, index) in statusData" :key="index" :span="6">
            <div class="status-card">
              <div class="status-icon" :class="status.iconClass">
                <el-icon>
                  <component :is="status.icon" />
                </el-icon>
              </div>
              <div class="status-info">
                <h4>{{ status.title }}</h4>
                <div class="status-value">{{ status.value }}</div>
                <div class="status-desc" v-html="status.desc"></div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 数据概览区 -->
        <div class="section-title">
          <h3>数据概览</h3>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-header">
                <h4>安全态势</h4>
                <el-dropdown size="small" @command="handleSecurityCommand">
                  <span class="chart-filter">
                    {{ securityChartData.period }} <el-icon><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        v-for="(item, index) in securityChartData.periodOptions" 
                        :key="index" 
                        :command="item"
                      >
                        {{ item }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="chart-placeholder">
                <el-icon><PieChart /></el-icon>
                <p>安全态势分布图</p>
              </div>
              <div class="chart-legend">
                <div v-for="(item, index) in securityChartData.legend" :key="index" class="legend-item">
                  <span class="legend-color" :class="item.level"></span>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <div class="chart-header">
                <h4>系统性能</h4>
                <el-dropdown size="small" @command="handlePerformanceCommand">
                  <span class="chart-filter">
                    {{ performanceChartData.period }} <el-icon><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        v-for="(item, index) in performanceChartData.periodOptions" 
                        :key="index" 
                        :command="item"
                      >
                        {{ item }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="chart-placeholder">
                <el-icon><DataAnalysis /></el-icon>
                <p>系统性能趋势图</p>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 快速访问区 -->
        <div class="section-title">
          <h3>快速操作</h3>
        </div>
        <div class="quick-access">
          <div 
            v-for="(item, index) in quickAccessData" 
            :key="index" 
            class="access-item"
            @click="handleQuickAccess(item.action)"
          >
            <div class="access-icon">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="access-text">{{ item.label }}</div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="section-title">
          <h3>最近活动</h3>
          <el-link type="primary">查看全部</el-link>
        </div>
        <div class="recent-activities">
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="index" 
            class="activity-item"
          >
            <div class="activity-time">{{ activity.time }}</div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-desc">{{ activity.desc }}</div>
            </div>
            <div class="activity-action">
              <el-button size="small" :type="activity.buttonType" plain>
                {{ activity.buttonText }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Close,
  Monitor,
  Connection,
  DataAnalysis as DataAnalysisIcon,
  Files,
  ArrowDown,
  PieChart,
  Search,
  Opportunity,
  VideoPlay,
  Document,
  MagicStick
} from '@element-plus/icons-vue'

// 定义状态卡片数据结构
interface StatusItem {
  title: string
  value: string
  desc: string
  icon: any
  iconClass: string
}

// 定义图表数据结构
interface ChartData {
  period: string
  periodOptions: string[]
  legend?: {
    level: string
    label: string
  }[]
}

// 定义快速访问项数据结构
interface QuickAccessItem {
  label: string
  icon: any
  action: string
}

// 定义活动项数据结构
interface ActivityItem {
  time: string
  title: string
  desc: string
  buttonText: string
  buttonType: 'primary' | 'danger' | 'info'
}

// 状态数据
const statusData = ref<StatusItem[]>([
  {
    title: '系统状态',
    value: '正常运行',
    desc: '已运行 30 天 12 小时',
    icon: Monitor,
    iconClass: 'success'
  },
  {
    title: '安全告警',
    value: '5',
    desc: '较昨日 <span class="text-danger">+2</span>',
    icon: Connection,
    iconClass: 'warning'
  },
  {
    title: '数据分析任务',
    value: '12',
    desc: '3 个待处理',
    icon: DataAnalysisIcon,
    iconClass: 'info'
  },
  {
    title: '资产总数',
    value: '356',
    desc: '服务器: 128 | 终端: 228',
    icon: Files,
    iconClass: 'primary'
  }
])

// 安全态势图表数据
const securityChartData = ref<ChartData>({
  period: '本月',
  periodOptions: ['今日', '本周', '本月', '全年'],
  legend: [
    { level: 'high', label: '高风险: 5' },
    { level: 'medium', label: '中风险: 12' },
    { level: 'low', label: '低风险: 28' }
  ]
})

// 系统性能图表数据
const performanceChartData = ref<ChartData>({
  period: '近7天',
  periodOptions: ['今日', '近7天', '近30天']
})

// 快速访问数据
const quickAccessData = ref<QuickAccessItem[]>([
  { label: '安全检索', icon: Search, action: 'search' },
  { label: '威胁猎杀', icon: Opportunity, action: 'hunt' },
  { label: '调查分析', icon: VideoPlay, action: 'investigate' },
  { label: '报告中心', icon: Document, action: 'report' },
  { label: '智能配置', icon: MagicStick, action: 'config' }
])

// 最近活动数据
const recentActivities = ref<ActivityItem[]>([
  {
    time: '10:25',
    title: '检测到高危漏洞',
    desc: '服务器 S-192.168.1.105 存在 Log4j 远程代码执行漏洞',
    buttonText: '处理',
    buttonType: 'danger'
  },
  {
    time: '09:18',
    title: '完成渗透测试',
    desc: '周期性安全评估已完成，生成报告可在报告中心查看',
    buttonText: '查看',
    buttonType: 'info'
  },
  {
    time: '昨天',
    title: '数据分析任务',
    desc: '网络流量分析任务已完成，发现3个异常连接',
    buttonText: '详情',
    buttonType: 'primary'
  }
])

// Emit事件，用于通知父组件关闭抽屉
const emit = defineEmits(['close'])

// 关闭抽屉
const closeDrawer = () => {
  emit('close')
}

// 处理安全态势筛选
const handleSecurityCommand = (command: string) => {
  securityChartData.value.period = command
}

// 处理系统性能筛选
const handlePerformanceCommand = (command: string) => {
  performanceChartData.value.period = command
}

// 处理快速访问点击
const handleQuickAccess = (action: string) => {
  console.log(`执行快速操作: ${action}`)
  // 这里可以添加具体的业务逻辑
}
</script>

<style scoped>
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.drawer-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.overview-container {
  padding: 10px 5px;
}

/* 状态卡片样式 */
.status-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 12px;
  font-size: 24px;
}

.status-icon.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-icon.warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.status-icon.info {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.status-icon.primary {
  background-color: rgba(103, 119, 239, 0.1);
  color: #6777ef;
}

.status-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.status-info h4 {
  margin: 0 0 5px;
  font-size: 14px;
  color: #606266;
  font-weight: normal;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.status-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.text-danger {
  color: #f56c6c;
}

/* 标题样式 */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.section-title h3 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
  color: #303133;
}

/* 图表容器样式 */
.chart-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-filter {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
}

.chart-filter .el-icon {
  margin-left: 4px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  background-color: #f9f9f9;
  border-radius: 6px;
  color: #909399;
  margin-bottom: 12px;
}

.chart-placeholder .el-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.7;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}

.legend-color.high {
  background-color: #f56c6c;
}

.legend-color.medium {
  background-color: #e6a23c;
}

.legend-color.low {
  background-color: #67c23a;
}

/* 快速访问区样式 */
.quick-access {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.access-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.access-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f2f5;
  margin-bottom: 8px;
}

.access-icon .el-icon {
  font-size: 24px;
  color: #409eff;
}

.access-text {
  font-size: 14px;
  color: #606266;
}

/* 最近活动样式 */
.recent-activities {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  width: 50px;
  color: #909399;
  font-size: 13px;
}

.activity-content {
  flex: 1;
  margin: 0 12px;
}

.activity-title {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.activity-action {
  margin-left: 12px;
}
</style>