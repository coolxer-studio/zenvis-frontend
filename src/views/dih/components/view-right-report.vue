<template>
  <div class="panel right-panel">
    <!-- 选项卡 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" class="right-tabs">
        <el-tab-pane label="文档" name="config">
          <div class="content-wrapper">
            <!-- 目录 -->
            <div class="catalogue">
              <!-- 目录标题 -->
              <div class="catalogueTitleContainer">
                <div class="catalogueTitle">大纲</div>
              </div>
              <!-- 目录列表 -->
              <div class="catalogueList">
                <ul class="ul-list">
                  <li 
                    v-for="(item, index) in directory" 
                    :key="item.id" 
                    :class="{ active: activeIndex === index }"
                    @click="handleItemClick(index, item.id)" 
                    :style="{ paddingLeft: (item.level - 1) * 10 + 'px' }">
                    {{ item.text }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="editorContainer">
              <!-- 工具 -->
              <Toolbar class="ToolbarStyle" :editor="editorRef" :defaultConfig="toolbarConfig" />
              <!-- 编辑 -->
              <Editor 
                class="EditorStyle" 
                v-model="ValueHtml" 
                :defaultConfig="editorConfig" 
                @onCreated="handleCreated"
                @onChange="currentInputValueChange" />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="归档" name="artifacts">
          <div class="artifacts-container">
            <div 
              v-for="(report, index) in reports" 
              :key="index" 
              class="report-item">
              <div class="report-icon">
                <el-icon><component :is="report.icon" /></el-icon>
              </div>
              <div class="report-info">
                <div class="report-name">{{ report.name }}</div>
                <div class="report-time">{{ report.time }}</div>
              </div>
              <div class="report-actions">
                <el-button type="primary" size="small" plain @click="downloadArtifact(index)">
                  下载
                </el-button>
                <el-button type="info" size="small" plain @click="viewArtifact(index)">
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
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { 
  Document, Files, PieChart, Connection
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import "@wangeditor/editor/dist/css/style.css"
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"
import { Node, Editor as SlateEditor, Transforms } from 'slate'
import { setupMonacoWorkers } from '@u/monaco-workers'

// 定义产物接口
interface Report {
  name: string
  time: string
  icon: any
}

// 定义目录项接口
interface DirectoryItem {
  id: string
  text: string
  level: number
}

const emit = defineEmits(["event"])
const editorRef = shallowRef<any>(null) // 编辑器实例
const ValueHtml = ref<string>("") // 编辑器内容
const directory = ref<DirectoryItem[]>([]) // 用于存储目录标题元素的数组
const activeIndex = ref<number>(0) // 滚动编辑器时动态切换目录标题高亮效果
let scrollContainer: HTMLElement | null = null // 存储实际滚动容器

// 当前激活的选项卡
const activeTab = ref<string>('config')

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
const reports = ref<Report[]>([
  {
    name: '文档-v1.0.0',
    time: '2023-07-01 12:00:00',
    icon: Document
  },
  {
    name: '文档-v1.0.1',
    time: '2023-07-01 12:00:00',
    icon: Document
  },
  {
    name: '文档-v1.0.2',
    time: '2023-07-01 12:00:00',
    icon: Document
  }
])

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

// 下载产物
const downloadArtifact = (index: number) => {
  const artifact = reports.value[index]
  console.log(`下载产物: ${artifact.name}`)
  // 这里可以添加实际的下载逻辑
}

// 查看产物
const viewArtifact = (index: number) => {
  const artifact = reports.value[index]
  console.log(`查看产物: ${artifact.name}`)
  // 这里可以添加实际的查看逻辑
}

// 生成目录
const generateTableOfContents = () => {
  if (!editorRef.value) return []
  const editor = editorRef.value
  // 获取所有标题节点（Slate 节点格式）
  const headings = editor.getElemsByTypePrefix('header')
  return headings.map((node: any, index: number) => {
    // 确保 ID 存在（使用 Slate 的 Transforms 修改节点）
    if (!node.id) {
      const id = `header-${index}-${Date.now()}`
      const path = SlateEditor.path(editor, node) // 获取节点路径
      Transforms.setNodes(editor, { id } as any, { at: path }) // 正确设置 ID
    }
    // 获取文本内容（正确方法）
    const text = Node.string(node) // 使用 slate 的 Node.string
    return {
      id: node.id,
      text: text,
      level: parseInt(node.type.replace('header', '')) // 假设类型是 header1/header2 等
    }
  })
}

// 当用户开始输入时触发的回调
const currentInputValueChange = (editor: any) => {
  directory.value = generateTableOfContents()
}

// 点击目录项处理
const handleItemClick = (index: number, id: string) => {
  activeIndex.value = index
  if (scrollContainer) {
    scrollToSection(id)
  } else {
    console.warn('scrollContainer is null when trying to scroll to section')
  }
}

// 局部滚动逻辑 - 添加了边界检查和动画优化
const scrollToSection = (id: string) => {
  if (!editorRef.value || !scrollContainer) {
    console.warn('Either editorRef or scrollContainer is null when trying to scroll to section')
    return
  }
  
  const target = scrollContainer.querySelector(`#${id}`)
  if (!target) {
    console.warn(`Target with id ${id} not found when trying to scroll to section`)
    return
  }
  
  // 获取目标元素顶部相对于容器的位置
  const targetTop = (target as HTMLElement).offsetTop - scrollContainer.offsetTop
  
  // 设置顶部偏移量（根据需求调整）
  const topOffset = 20 // 单位：px，可自由配置
  
  // 计算滚动目标位置
  const scrollTarget = Math.max(0, targetTop - topOffset)
  
  // 获取容器最大滚动高度
  const maxScrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
  
  // 确保滚动位置不会超出边界
  const finalScrollTarget = Math.min(scrollTarget, maxScrollHeight)
  
  // 平滑滚动到目标位置
  scrollContainer.scrollTo({
    top: finalScrollTarget,
    behavior: "smooth",
  })
}

// 滚动监听函数：用于在滚动时动态更新当前激活的目录项
const handleScroll = () => {
  // 确保滚动容器存在
  const container = scrollContainer
  if (!container) {
    console.warn('scrollContainer is null when trying to handle scroll')
    return
  }
  
  // 获取所有标题元素
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5")
  
  // 如果没有找到标题元素，不更新激活索引
  if (headings.length === 0) {
    console.warn('No headings found in scroll container')
    return
  }
  
  // 获取当前滚动位置和容器高度
  const scrollTop = container.scrollTop // 当前滚动位置
  const containerHeight = container.clientHeight // 可视区域高度
  let closestIndex = 0 // 当前最近的标题索引
  let minDistance = Infinity // 最小距离初始值（设为极大值）
  
  // 遍历所有标题元素
  headings.forEach((heading, index) => {
    // 确保heading是HTMLElement类型
    if (!(heading instanceof HTMLElement)) {
      console.warn('Found heading is not a valid HTMLElement')
      return
    }
    
    // 计算标题顶部相对于容器的绝对位置
    const headingTop = heading.offsetTop - container.offsetTop
    
    /* 核心算法：计算距离系数
       - scrollTop + containerHeight * 0.3：表示当前可视区域的"触发线"位置
       - 将可视区域分为上下三部分，当标题进入上1/3区域时触发切换
       - 0.3系数可根据需求调整（值越小需要滚动更多位置才切换）*/
    const distance = Math.abs(headingTop - (scrollTop + containerHeight * 0.3))
    
    // 找到距离最小的标题
    if (distance < minDistance) {
      minDistance = distance // 更新最小距离
      closestIndex = index // 更新最近标题索引
    }
  })

  // 更新当前激活的目录项索引
  activeIndex.value = closestIndex
}

// 编辑器创建后的初始化处理
const handleCreated = (editor: any) => {
  // 保存编辑器实例
  editorRef.value = editor
  
  // 获取编辑器DOM容器
  const editorDom = editor.getEditableContainer()
  if (!editorDom) {
    console.error('Editor container not found when initializing')
    return
  }
  
  /* 获取真实滚动容器（兼容不同版本）
     - 新版wangEditor使用 .w-e-scroll 作为滚动容器
     - 如果不存在则直接使用编辑器容器 */
  scrollContainer = editorDom.querySelector(".w-e-scroll")
  if (!scrollContainer) scrollContainer = editorDom
  
  /* 添加优化后的滚动监听
     - passive: true 提升滚动性能
     - 注意：这里不需要防抖，因为计算逻辑已经优化 */
  if (scrollContainer) {
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
  } else {
    console.warn('Scroll container is null when adding scroll listener')
  }
  
  /* 延迟初始化目录内容
     - 300ms延迟确保DOM完全渲染
     - 避免立即获取时元素未加载完成 */
  setTimeout(() => {
    directory.value = generateTableOfContents()
  }, 300)
}

// 生命周期（完善销毁逻辑）
onBeforeUnmount(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener("scroll", handleScroll)
  }
  if (editorRef.value && !editorRef.value.isDestroyed) {
    editorRef.value.destroy()
  }
  editorRef.value = null
})

// 编辑器配置
const editorConfig = {}
// 工具栏配置
const toolbarConfig = {}
</script>

<style lang="scss" scoped="scoped">
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

/* 产物面板样式 */
.artifacts-container {
  padding: 12px;
}

.report-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.report-icon {
  font-size: 24px;
  margin-right: 12px;
  color: #409eff;
}

.report-info {
  flex: 1;
}

.report-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.report-time {
  font-size: 12px;
  color: #909399;
}

.report-actions {
  display: flex;
  gap: 8px;
}

// 变量定义 - 便于主题定制
$primary-color: #1a73e8;
$primary-light: #e8f0fe;
$border-color: #e5e7eb;
$bg-color: #ffffff;
$bg-light: #f7f8fa;
$text-primary: #333;
$text-secondary: #555;
$text-tertiary: #666;
$transition-speed: 0.2s;

// 目录 + 编辑区域容器
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;

  // 响应式设计 - 在小屏幕上堆叠显示
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }

  // 目录区域
  .catalogue {
    height: 100%;
    width: 18%;
    min-width: 180px;
    box-sizing: border-box;
    border: 1px solid $border-color;
    border-top: none;
    background-color: $bg-color;
    box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
    transition: transform $transition-speed ease, box-shadow $transition-speed ease;

    // 响应式设计
    @media (max-width: 768px) {
      width: 100%;
      height: auto;
      max-height: 200px;
      border-left: 1px solid $border-color;
    }

    // 目录标题容器
    .catalogueTitleContainer {
      width: 100%;
      height: 40px;
      padding: 0 16px;
      background-color: $bg-light;
      display: flex;
      align-items: center;
      border-bottom: 1px solid $border-color;

      // 目录标题
      .catalogueTitle {
        color: $text-primary;
        font-size: 14px;
        font-weight: 600;
      }
    }

    // 目录列表
    .catalogueList {
      white-space: nowrap;
      width: 100%;
      height: calc(100% - 40px);
      margin: 0;
      padding: 0;
      overflow-x: auto;
      overflow-y: auto;

      .ul-list {
        width: 100%;
        list-style-type: none;
        margin: 0;
        padding: 8px 0;

        li {
          transition: all $transition-speed ease;
          font-weight: 400;
          cursor: pointer;
          padding: 6px 16px;
          margin-bottom: 1px;
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          border-left: 3px solid transparent;
        }

        li:hover {
          background-color: $bg-light;
          transform: translateX(2px);
        }

        // 为不同级别的标题添加样式
        li[style*="padding-left: 0px"] {
          font-weight: 600;
          color: $text-primary;

          &::before {
            content: "●";
            color: #4285f4;
            margin-right: 8px;
            font-size: 8px;
            vertical-align: middle;
          }
        }

        li[style*="padding-left: 10px"] {
          font-weight: 500;
          color: $text-secondary;

          &::before {
            content: "○";
            color: #ea4335;
            margin-right: 8px;
            font-size: 8px;
            vertical-align: middle;
          }
        }

        li[style*="padding-left: 20px"] {
          font-weight: 400;
          color: $text-tertiary;

          &::before {
            content: "▷";
            color: #fbbc05;
            margin-right: 8px;
            font-size: 8px;
            vertical-align: middle;
          }
        }
      }
    }
  }

  // 整个页面容器
  .editorContainer {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $bg-color;

    // 工具栏
    .ToolbarStyle {
      width: 100%;
      border: 1px solid $border-color;
      background: $bg-color;
      z-index: 10; // 确保工具栏在编辑器上方
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: box-shadow $transition-speed ease;

      &:hover {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }
    }

    // 编辑器区域
    .EditorStyle {
      width: 100%;
      min-height: 500px !important;
      height: 100% !important;
      overflow-y: auto !important;
      border: 1px solid $border-color;
      border-top: none;
      border-left: none;
      transition: border-color $transition-speed ease;

      &:focus-within {
        border-color: $primary-color;
      }

      // 响应式设计
      @media (max-width: 768px) {
        width: 100%;
        border-left: 1px solid $border-color;
        min-height: 300px !important;
      }
    }
  }
}

// 激活的目录项样式
.active {
  color: $primary-color !important;
  background-color: $primary-light !important;
  font-weight: 600 !important;
  border-left: 3px solid $primary-color;
  padding-left: calc(16px - 3px) !important;
  /* 调整左边距以补偿边框 */
  transform: translateX(2px);
}
</style>
