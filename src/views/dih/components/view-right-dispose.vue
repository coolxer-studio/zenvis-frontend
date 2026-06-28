<template>
  <div class="panel right-panel">
    <!-- 选项卡 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="right-tabs">
        <el-tab-pane label="控制台" name="config">
          <div class="config-container">
            <div class="config-header">
              <div class="config-title">
                <el-icon><Document /></el-icon>
                策略配置
              </div>
              <div class="config-actions">
                <el-button size="small" type="primary" @click="saveConfig">保存</el-button>
                <el-button size="small" @click="resetConfig">重置</el-button>
              </div>
            </div>
            <div class="editor-container" ref="editorContainer"></div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="试验场" name="visualization">
          <div class="simulation-container">
            <div class="simulation-header">
              <h3>策略模拟试验</h3>
              <p>在此进行策略的模拟测试和验证</p>
            </div>
            <div class="simulation-content">
              <div class="simulation-controls">
                <el-button type="primary" @click="runSimulation">运行模拟</el-button>
                <el-button @click="clearResults">清空结果</el-button>
              </div>
              <div class="simulation-results">
                <div class="results-placeholder" v-if="!simulationResults.length">
                  <el-icon><Files /></el-icon>
                  <p>点击"运行模拟"开始策略测试</p>
                </div>
                <div v-else>
                  <div 
                    v-for="(result, index) in simulationResults" 
                    :key="index" 
                    class="result-item"
                  >
                    <div class="result-header">
                      <span class="result-title">{{ result.title }}</span>
                      <span class="result-status" :class="result.status">{{ result.status }}</span>
                    </div>
                    <div class="result-content">
                      {{ result.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue'
import { 
  Document, Files
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { setupMonacoWorkers } from '@u/monaco-workers'

// 当前激活的选项卡
const activeTab = ref('config')

// Monaco Editor 相关
const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 模拟结果接口
interface SimulationResult {
  title: string
  status: '成功' | '失败' | '运行中'
  content: string
}

// 模拟结果数据
const simulationResults = ref<SimulationResult[]>([])

// 示例配置文件内容
const configContent = `# 策略配置文件
[策略配置]
# 网络访问控制
[[rules]]
name = "允许内部访问"
source = "192.168.1.0/24"
destination = "internal"
action = "allow"

[[rules]]
name = "阻止外部FTP"
source = "external"
destination_port = "21"
action = "deny"

# 进程监控
[process_monitor]
enabled = true
monitor_paths = ["/usr/bin", "/bin"]
alert_on_execution = true

# 文件保护
[file_protection]
protected_paths = ["/etc/passwd", "/etc/shadow"]
allow_processes = ["vim", "nano"]
`

onMounted(() => {
  // 初始化Monaco编辑器
  if (editorContainer.value) {
    setupMonacoWorkers()
    editor = monaco.editor.create(editorContainer.value, {
      value: configContent,
      language: 'toml',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      readOnly: false,
    })
  }
})

onBeforeUnmount(() => {
  // 销毁编辑器
  if (editor) {
    editor.dispose()
  }
})

// 保存配置
const saveConfig = () => {
  if (editor) {
    const value = editor.getValue()
    console.log('保存配置:', value)
    // 这里可以添加实际的保存逻辑
    alert('配置已保存')
  }
}

// 重置配置
const resetConfig = () => {
  if (editor) {
    editor.setValue(configContent)
    console.log('重置配置')
    // 这里可以添加实际的重置逻辑
    alert('配置已重置')
  }
}

// 运行模拟
const runSimulation = () => {
  console.log('运行模拟')
  // 模拟测试过程
  simulationResults.value = [
    {
      title: '网络策略测试',
      status: '成功',
      content: '所有网络访问规则验证通过'
    },
    {
      title: '进程监控测试',
      status: '成功',
      content: '进程监控功能正常运行'
    },
    {
      title: '文件保护测试',
      status: '运行中',
      content: '正在验证文件访问控制规则...'
    }
  ]
}

// 清空结果
const clearResults = () => {
  simulationResults.value = []
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

/* 配置面板样式 */
.config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #2d2d30;
  color: #e0e0e0;
}

.config-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.editor-container {
  flex: 1;
  min-height: 500px;
}

/* 试验场样式 */
.simulation-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.simulation-header {
  margin-bottom: 20px;
}

.simulation-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.simulation-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.simulation-controls {
  margin-bottom: 20px;
}

.simulation-results {
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 300px;
  background: #fff;
}

.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #999;
}

.results-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.result-title {
  font-weight: 500;
}

.result-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.result-status.成功 {
  background-color: #f0f9eb;
  color: #67c23a;
}

.result-status.失败 {
  background-color: #fef0f0;
  color: #f56c6c;
}

.result-status.运行中 {
  background-color: #ecf5ff;
  color: #409eff;
}

.result-content {
  color: #666;
  font-size: 14px;
}
</style>
