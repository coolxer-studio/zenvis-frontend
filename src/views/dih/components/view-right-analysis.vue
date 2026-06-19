<template>
  <div class="panel right-panel">
    <!-- 选项卡 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="right-tabs">
        <el-tab-pane label="分析链" name="analysisChain">
          <div class="analysis-chain-container">
            <div class="mindmap-container">
              <div class="mindmap-placeholder" v-if="!mindmapDataLoaded">
                <el-icon><Connection /></el-icon>
                <p>分析链思维导图</p>
                <p class="description">展示分析思路和步骤的思维导图</p>
                <el-button type="primary" @click="loadMindmapData">加载思维导图</el-button>
              </div>
              <div class="mindmap-content" v-else>
                <!-- 这里将展示思维导图 -->
                <div class="mindmap-chart">
                  <div class="mindmap-node root">
                    <div class="node-content">分析目标</div>
                    <div class="children">
                      <div class="mindmap-node child">
                        <div class="node-content">数据采集</div>
                        <div class="children">
                          <div class="mindmap-node leaf">网络流量</div>
                          <div class="mindmap-node leaf">进程行为</div>
                          <div class="mindmap-node leaf">文件操作</div>
                        </div>
                      </div>
                      <div class="mindmap-node child">
                        <div class="node-content">威胁检测</div>
                        <div class="children">
                          <div class="mindmap-node leaf">异常连接</div>
                          <div class="mindmap-node leaf">恶意进程</div>
                          <div class="mindmap-node leaf">可疑文件</div>
                        </div>
                      </div>
                      <div class="mindmap-node child">
                        <div class="node-content">关联分析</div>
                        <div class="children">
                          <div class="mindmap-node leaf">时间序列</div>
                          <div class="mindmap-node leaf">行为模式</div>
                        </div>
                      </div>
                      <div class="mindmap-node child">
                        <div class="node-content">结论输出</div>
                        <div class="children">
                          <div class="mindmap-node leaf">威胁评估</div>
                          <div class="mindmap-node leaf">处理建议</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="战利品" name="loot">
          <div class="loot-container">
            <div 
              v-for="(loot, index) in lootItems" 
              :key="index" 
              class="loot-item"
            >
              <div class="loot-icon">
                <el-icon><component :is="loot.icon" /></el-icon>
              </div>
              <div class="loot-info">
                <div class="loot-name">{{ loot.name }}</div>
                <div class="loot-description">{{ loot.description }}</div>
                <div class="loot-path">{{ loot.path }}</div>
              </div>
              <div class="loot-actions">
                <el-button type="primary" size="small" plain @click="downloadLoot(index)">
                  下载
                </el-button>
                <el-button type="info" size="small" plain @click="viewLoot(index)">
                  查看
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="分析结果" name="result">
          <div class="result-container">
            <div class="result-summary">
              <div class="summary-item">
                <div class="summary-label">分析状态:</div>
                <div class="summary-value success">已完成</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">威胁等级:</div>
                <div class="summary-value high-risk">高危</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">分析时间:</div>
                <div class="summary-value">2023-06-15 14:30:22</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">分析用时:</div>
                <div class="summary-value">5分30秒</div>
              </div>
            </div>
            
            <div class="result-details">
              <el-collapse v-model="activeResultPanel">
                <el-collapse-item title="详细分析报告" name="report">
                  <div class="report-content">
                    <p>分析报告内容...</p>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="检测到的威胁" name="threats">
                  <div class="threats-content">
                    <el-table :data="threats" style="width: 100%" border>
                      <el-table-column prop="name" label="威胁名称" width="180" />
                      <el-table-column prop="type" label="威胁类型" width="120" />
                      <el-table-column prop="severity" label="严重等级" width="120">
                        <template #default="scope">
                          <el-tag :type="getThreatTagType(scope.row.severity)">
                            {{ scope.row.severity }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column prop="description" label="描述" />
                    </el-table>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="建议措施" name="recommendations">
                  <div class="recommendations-content">
                    <ul>
                      <li>立即隔离受感染的设备</li>
                      <li>更新防火墙规则阻止相关IP地址</li>
                      <li>对系统进行全面病毒扫描</li>
                      <li>修改相关账户密码</li>
                    </ul>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { 
  Document, Files, DataAnalysis, Connection, Warning
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'

// 当前激活的选项卡
const activeTab = ref('analysisChain')

// 思维导图数据是否已加载
const mindmapDataLoaded = ref(false)

// 战利品数据
const lootItems = ref([
  {
    name: '内存转储文件',
    description: '进程内存快照',
    path: '/artifacts/memory_dump_20230615.bin',
    icon: Document
  },
  {
    name: '网络流量捕获',
    description: '分析期间的网络通信记录',
    path: '/artifacts/network_capture_20230615.pcap',
    icon: DataAnalysis
  },
  {
    name: '注册表导出',
    description: '系统注册表快照',
    path: '/artifacts/registry_export_20230615.reg',
    icon: Files
  },
  {
    name: '日志文件',
    description: '系统和应用程序日志',
    path: '/artifacts/system_logs_20230615.zip',
    icon: Document
  }
])

// 威胁数据
const threats = ref([
  {
    name: '可疑网络连接',
    type: '网络威胁',
    severity: '高危',
    description: '检测到与已知恶意服务器的连接'
  },
  {
    name: '异常进程行为',
    type: '主机威胁',
    severity: '中危',
    description: '发现异常进程创建行为'
  },
  {
    name: '可疑文件操作',
    type: '文件威胁',
    severity: '中危',
    description: '检测到对系统关键文件的未授权访问'
  }
])

// 分析结果面板
const activeResultPanel = ref(['report', 'threats', 'recommendations'])

// 获取威胁标签类型
const getThreatTagType = (severity: string) => {
  switch (severity) {
    case '高危': return 'danger'
    case '中危': return 'warning'
    case '低危': return 'info'
    default: return 'info'
  }
}

onMounted(() => {
  // 初始化相关逻辑
})

onBeforeUnmount(() => {
  // 清理逻辑
})

// 加载思维导图数据
const loadMindmapData = () => {
  mindmapDataLoaded.value = true
}

// 下载战利品
const downloadLoot = (index: number) => {
  const loot = lootItems.value[index]
  console.log(`下载战利品: ${loot.name}`)
  // 这里可以添加实际的下载逻辑
}

// 查看战利品
const viewLoot = (index: number) => {
  const loot = lootItems.value[index]
  console.log(`查看战利品: ${loot.name}`)
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

/* 分析链样式 */
.analysis-chain-container {
  padding: 20px;
  height: 100%;
}

.mindmap-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mindmap-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #909399;
}

.mindmap-placeholder .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.mindmap-placeholder p {
  margin: 8px 0;
  font-size: 16px;
}

.mindmap-placeholder .description {
  font-size: 14px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.mindmap-content {
  flex: 1;
  overflow: auto;
}

.mindmap-chart {
  padding: 20px;
  min-width: 800px;
  min-height: 500px;
}

.mindmap-node {
  display: inline-block;
  text-align: center;
  position: relative;
}

.mindmap-node.root {
  margin: 0 auto;
  display: block;
}

.mindmap-node.child {
  margin: 20px 40px;
  display: inline-block;
  vertical-align: top;
}

.mindmap-node.leaf {
  margin: 10px 20px;
  display: block;
}

.node-content {
  background-color: #409eff;
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.mindmap-node.child .node-content {
  background-color: #67c23a;
}

.mindmap-node.leaf .node-content {
  background-color: #909399;
  font-size: 12px;
  padding: 6px 12px;
}

.children {
  margin-top: 20px;
}

.mindmap-node.child .children {
  margin-top: 15px;
}

.mindmap-node.leaf .children {
  margin-top: 10px;
}

.mindmap-node:not(.root) .children::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 10px;
  background-color: #dcdfe6;
}

/* 连接线 */
.mindmap-node.child::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background-color: #dcdfe6;
}

.mindmap-node.child::after {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #dcdfe6;
}

/* 战利品样式 */
.loot-container {
  padding: 12px;
}

.loot-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.loot-icon {
  font-size: 28px;
  margin-right: 16px;
  color: #409eff;
}

.loot-info {
  flex: 1;
}

.loot-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.loot-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.loot-path {
  font-size: 12px;
  color: #909399;
}

.loot-actions {
  display: flex;
  gap: 8px;
}

/* 分析结果样式 */
.result-container {
  padding: 20px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-weight: 600;
  margin-right: 12px;
  white-space: nowrap;
}

.summary-value {
  flex: 1;
}

.summary-value.success {
  color: #67c23a;
}

.summary-value.high-risk {
  color: #f56c6c;
}

.result-details {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.el-collapse-item__header) {
  padding-left: 20px;
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-collapse-item__wrap) {
  padding: 20px;
}

.threats-content {
  padding: 10px 0;
}

.recommendations-content ul {
  padding-left: 20px;
}

.recommendations-content li {
  margin-bottom: 8px;
}
</style>