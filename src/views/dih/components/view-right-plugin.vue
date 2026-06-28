<template>
  <div class="panel right-panel">
    <!-- 选项卡 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="right-tabs">
        <el-tab-pane label="文档" name="doc">
          <div class="config-container">
            <!-- 嵌入 plugin-config 路由地址页面 -->
            <iframe 
              :src="docUrl" 
              class="plugin-config-frame"
              frameborder="0"
              width="100%"
              height="100%"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="元数据配置" name="meta">
          <div class="config-container">
            <!-- 嵌入 plugin-config 路由地址页面 -->
            <iframe 
              :src="metaUrl" 
              class="plugin-config-frame"
              frameborder="0"
              width="100%"
              height="100%"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="数据推送" name="push-task">
          <div class="config-container">
            <!-- 嵌入 plugin-config 路由地址页面 -->
            <iframe 
              :src="pushTaskUrl" 
              class="plugin-config-frame"
              frameborder="0"
              width="100%"
              height="100%"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </el-tab-pane>

        <el-tab-pane label="API扩展" name="visualization">
          <div class="file-upload-container">
            <el-upload
              class="upload-demo"
              drag
              action=""
              :auto-upload="false"
              v-model:file-list="fileList"
              multiple
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  请上传扩展插件文件
                </div>
              </template>
            </el-upload>
            
            <div class="uploaded-files" v-if="fileList.length > 0">
              <h4>已选择文件:</h4>
              <div 
                v-for="(file, index) in fileList" 
                :key="index" 
                class="file-item"
              >
                <el-icon><document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  circle 
                  @click="removeFile(index)"
                >
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="upload-actions">
              <el-button 
                type="success" 
                @click="submitUpload"
                :disabled="fileList.length === 0"
                :loading="uploadLoading"
              >
                <el-icon><check /></el-icon>
                应用
              </el-button>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="可视化" name="ui">
          <div class="config-container">
            <!-- 嵌入 plugin-config 路由地址页面 -->
            <iframe 
              :src="uiUrl" 
              class="plugin-config-frame"
              frameborder="0"
              width="100%"
              height="100%"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="菜单" name="menu">
          <div class="config-container">
            <!-- 嵌入 plugin-config 路由地址页面 -->
            <iframe 
              :src="menuUrl" 
              class="plugin-config-frame"
              frameborder="0"
              width="100%"
              height="100%"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="产物" name="products">
          <div class="products-container">
            <div 
              v-for="(product, index) in products" 
              :key="index" 
              class="product-item"
            >
              <div class="product-icon">
                <el-icon>
                  <component :is="typeof product.icon === 'string' && product.icon.startsWith('data:image') ? 'img' : product.icon" 
              :src="typeof product.icon === 'string' && product.icon.startsWith('data:image') ? product.icon : undefined" />
            </el-icon>
              </div>
              <div class="product-info">
                <div class="product-version">{{ product.version }}</div>
                <div class="product-time">{{ product.time }}</div>
              </div>
              <div class="product-actions">
                <el-button type="primary" size="small" plain @click="downloadProduct(index)">
                  下载
                </el-button>
                <el-button type="info" size="small" plain @click="viewProduct(index)">
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { 
  Document, Files, PieChart, Connection, UploadFilled, Delete, Check
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { sanitizeIframeUrl } from '@u/url'
import { setupMonacoWorkers } from '@u/monaco-workers'

// 定义产物接口
interface Product {
  version: string
  time: string
  icon: any
}

// 当前激活的选项卡
const activeTab = ref('doc')

// plugin-config 路由地址
const baseUrl = '/#/plugin/config/plugin-build|ef62f8fc-f5f8-4f67-b164-a045df47000b'
const docUrl = computed(() => sanitizeIframeUrl(baseUrl + '|00_doc'))
const metaUrl = computed(() => sanitizeIframeUrl(baseUrl + '|01_meta'))
const pushTaskUrl = computed(() => sanitizeIframeUrl(baseUrl + '|02_push-task'))
const uiUrl = computed(() => sanitizeIframeUrl(baseUrl + '|04_ui'))
const menuUrl = computed(() => sanitizeIframeUrl(baseUrl + '|05_menu'))

// Monaco Editor 相关
const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 示例配置文件内容
const configContent = `# frpc.toml 配置文件
serverAddr = "10.106.108.110"
serverPort = 8080
token = "12345678"

[web]
type = "http"
localPort = 80
customDomains = ["example.com"]

[ssh]
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = 6000

[plugin.unix_domain_socket]
type = "unix_domain_socket"
remotePort = 6001
socketPath = "/tmp/docker.sock"

[plugin.registry]
type = "tcp"
remotePort = 6002
plugin = "http_proxy"
pluginOpts = { host = "0.0.0.0", port = "9001" }
`

// 产物数据
const products = ref<Product[]>([
  {
    version: 'v1.0.0',
    time: '2025-08-31 12:00:00',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAxElEQVR4nO2WUQrCMBBE5xgWzHfOrg3kYiomF1gRRgjBIu62icU82J+0nZlCOikw2DEOQACQORGAb2l+BSDV3HhtcwINzwAOnLlY25xMs6fxi4lraU0j+TDW+/cTwMoIIN/ouKJgLAFUOm6hYDTmKp1QFYwWtU5+UzAa1Dq5d4DIB2dWqxa1jueJZt2EJh3HzZNW+AzNOvKXTfiTAaT3cSy9Amh+ye5oQKyKZir6/9QigF8omguAIxrhiqJJfPNm5gOsxQPpMbGNA2kKSAAAAABJRU5ErkJggg=='
  },
  {
    version: 'v1.0.1',
    time: '2025-08-31 12:02:00',
    icon: Files
  },
  {
    version: 'v1.0.2',
    time: '2025-08-31 12:03:00',
    icon: Document
  }
])

// 文件上传相关
const fileList = ref<any[]>([])
const uploadLoading = ref(false)

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

/**
 * 移除文件
 * @param index 文件索引
 */
const removeFile = (index: number): void => {
  fileList.value.splice(index, 1)
}

/**
 * 提交上传
 */
const submitUpload = (): void => {
  uploadLoading.value = true
  console.log('上传文件:', fileList.value)
  // 模拟上传过程
  setTimeout(() => {
    uploadLoading.value = false
    // 这里可以添加实际的上传逻辑
  }, 1000)
}

/**
 * 获取图标组件
 * @param icon 图标数据
 * @returns 图标组件
 */
const getIconComponent = (icon: any): string => {
  // 如果是base64图片数据，使用img标签
  if (typeof icon === 'string' && icon.startsWith('data:image')) {
    return 'img'
  }
  // 否则使用传入的组件
  return icon
}

/**
 * 获取图标src属性
 * @param icon 图标数据
 * @returns 图标src属性值
 */
const getIconSrc = (icon: any): string | undefined => {
  // 如果是base64图片数据，返回src
  if (typeof icon === 'string' && icon.startsWith('data:image')) {
    return icon
  }
  // 否则不设置src
  return undefined
}

onMounted(() => {
  // 初始化Monaco编辑器
  if (editorContainer.value) {
    setupMonacoWorkers()
    editor = monaco.editor.create(editorContainer.value, {
      value: configContent,
      language: 'ini',
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

/**
 * 保存配置
 */
const saveConfig = (): void => {
  if (editor) {
    const value = editor.getValue()
    console.log('保存配置:', value)
    // 这里可以添加实际的保存逻辑
  }
}

/**
 * 重置配置
 */
const resetConfig = (): void => {
  if (editor) {
    editor.setValue(configContent)
    console.log('重置配置')
    // 这里可以添加实际的重置逻辑
  }
}

/**
 * 下载产物
 * @param index 产物索引
 */
const downloadProduct = (index: number): void => {
  console.log('下载产物:', index)
  // 这里可以添加实际的下载逻辑
}

/**
 * 查看产物
 * @param index 产物索引
 */
const viewProduct = (index: number): void => {
  console.log('查看产物:', index)
  // 这里可以添加实际的查看逻辑
}
</script>

<style scoped>
.plugin-config-frame {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
  overflow: auto;
}

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
  height: 100%;
}

/* 选项卡样式 */
.tab-container {
  flex: 1;
  overflow: hidden;
  height: 100%;
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

/* 产物面板样式 */
.products-container {
  padding: 12px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.product-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #409eff;
}

.product-info {
  flex: 1;
}

.product-version {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-time {
  font-size: 12px;
  color: #909399;
}

.product-actions {
  display: flex;
  gap: 8px;
}

/* 配置面板样式 */
.config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

/* 文件上传样式 */
.file-upload-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin: 12px;
}

.upload-demo {
  margin-bottom: 20px;
}

.uploaded-files h4 {
  margin-bottom: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 8px;
}

.file-item .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-name {
  flex: 1;
  margin-right: 10px;
}

.file-size {
  color: #909399;
  font-size: 12px;
  margin-right: 10px;
}

.upload-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
