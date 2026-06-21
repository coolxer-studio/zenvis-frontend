<template>
  <div class="panel right-panel">
    <!-- 选项卡 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="right-tabs">
        <el-tab-pane label="检测项" name="inspection">
          <div class="inspection-container">
            <div 
              v-for="(item, index) in inspectionItems" 
              :key="index" 
              class="inspection-item"
              :class="{ 'passed': item.status === 'passed', 'failed': item.status === 'failed' }"
            >
              <div class="inspection-header">
                <el-icon class="inspection-icon">
                  <component :is="item.status === 'passed' ? Check : Close" />
                </el-icon>
                <div class="inspection-title">{{ item.title }}</div>
                <el-tag :type="item.status === 'passed' ? 'success' : 'danger'" size="small">
                  {{ item.status === 'passed' ? '通过' : '未通过' }}
                </el-tag>
              </div>
              <div class="inspection-description">
                {{ item.description }}
              </div>
              <div class="inspection-details" v-if="item.details">
                <pre>{{ item.details }}</pre>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="工具集" name="toolset">
          <div class="toolset-container">
            <div 
              v-for="(tool, index) in tools" 
              :key="index" 
              class="tool-item"
            >
              <div class="tool-icon">
                <el-icon><component :is="tool.icon" /></el-icon>
              </div>
              <div class="tool-info">
                <div class="tool-name">{{ tool.name }}</div>
                <div class="tool-description">{{ tool.description }}</div>
              </div>
              <div class="tool-actions">
                <el-button type="primary" size="small" plain @click="executeTool(index)">
                  执行
                </el-button>
                <el-button type="info" size="small" plain @click="viewTool(index)">
                  查看
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Document, Files, PieChart, Connection, Check, Close
} from '@element-plus/icons-vue'

// 定义检测项接口
interface InspectionItem {
  title: string
  description: string
  status: 'passed' | 'failed'
  details?: string
}

// 定义工具接口
interface Tool {
  name: string
  description: string
  icon: any
}

// 当前激活的选项卡
const activeTab = ref('inspection')

// 检测项数据
const inspectionItems = ref<InspectionItem[]>([
  {
    title: '网络连接检测',
    description: '检查目标主机网络连接状态',
    status: 'passed',
    details: '端口 22: 开放\n端口 80: 开放\n端口 443: 开放'
  },
  {
    title: '服务指纹识别',
    description: '识别目标主机运行的服务类型和版本',
    status: 'failed',
    details: '无法识别服务指纹，请检查目标主机状态'
  },
  {
    title: '漏洞扫描',
    description: '扫描目标主机存在的已知漏洞',
    status: 'passed',
    details: '未发现高危漏洞'
  }
])

// 工具数据
const tools = ref<Tool[]>([
  {
    name: '端口扫描',
    description: '扫描目标主机开放的端口',
    icon: PieChart
  },
  {
    name: '漏洞检测',
    description: '检测目标主机存在的安全漏洞',
    icon: Connection
  },
  {
    name: '目录爆破',
    description: '爆破目标主机存在的敏感目录',
    icon: Files
  },
  {
    name: '密码爆破',
    description: '对目标服务进行弱密码检测',
    icon: Document
  }
])

// 执行工具
const executeTool = (index: number) => {
  const tool = tools.value[index]
  console.log(`执行工具: ${tool.name}`)
  // 这里可以添加实际的执行逻辑
}

// 查看工具
const viewTool = (index: number) => {
  const tool = tools.value[index]
  console.log(`查看工具: ${tool.name}`)
  // 这里可以添加实际的查看逻辑
}
</script>

<style scoped>
/* 面板样式 */
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.right-panel {
  background-color: #f5f7fa;
  color: #333;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 选项卡样式 */
.tab-container {
  flex: 1;
  overflow: hidden;
}

.right-tabs {
  height: 100%;
}

:deep(.el-tabs__content) {
  padding: 0;
  height: calc(100% - 40px);
  overflow-y: auto;
}

:deep(.el-tabs__nav) {
  background-color: #fff;
  padding: 0px 30px;
  width: 100%;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

/* 检测项面板样式 */
.inspection-container {
  padding: 12px;
}

.inspection-item {
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #909399;
}

.inspection-item.passed {
  border-left-color: #67c23a;
}

.inspection-item.failed {
  border-left-color: #f56c6c;
}

.inspection-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.inspection-icon {
  font-size: 18px;
  margin-right: 8px;
  color: #909399;
}

.inspection-item.passed .inspection-icon {
  color: #67c23a;
}

.inspection-item.failed .inspection-icon {
  color: #f56c6c;
}

.inspection-title {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
}

.inspection-description {
  color: #606266;
  margin-bottom: 10px;
  font-size: 14px;
}

.inspection-details pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

/* 工具集面板样式 */
.toolset-container {
  padding: 12px;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #409eff;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.tool-description {
  font-size: 12px;
  color: #909399;
}

.tool-actions {
  display: flex;
  gap: 8px;
}

/* 产物面板样式 */
.artifacts-container {
  padding: 12px;
}

.artifact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.artifact-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #409eff;
}

.artifact-info {
  flex: 1;
}

.artifact-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.artifact-path {
  font-size: 12px;
  color: #909399;
}

.artifact-actions {
  display: flex;
  gap: 8px;
}

</style>