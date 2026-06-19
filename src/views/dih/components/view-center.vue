<template>
  <div class="panel center-panel">
    <!-- 中间面板标题 -->
    <div class="center-header">
      <h1 class="center-title">{{ chatSessionTitle }}</h1>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content">
      <!-- Enter提示信息 -->
      <!-- 已移除原来的 enter-tip 元素，改为使用 ElMessage 实现 toast 提示 -->
      <div class="message-list">
        <div v-for="(message, index) in messages" :key="index" class="message-item">
          <div v-if="message.sender === 'ai'" class="ai-message-container"
            @mouseenter="handleMouseEnter('ai', index)" 
            @mouseleave="handleMouseLeave('ai')">
            <div class="avatar ai-avatar">
              <el-icon :size="20"><Monitor /></el-icon>
            </div>
            <div class="message-bubble ai-message">
              <!-- 加载动画 -->
              <div v-if="message.loading" class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
              <!-- 渲染Markdown内容 -->
              <div v-else class="message-content markdown-body" v-html="parseMarkdown(message.content)"></div>
              <div class="message-time">{{ message.time }}</div>
              <!-- 新增：AI消息的交互按钮 -->
              <div class="message-actions" v-show="isHoveredAiMessage === index">
                <el-button @click="copyMessage(message.content)" size="small" icon="CopyDocument">复制</el-button>
                <el-button @click="shareMessage(message.content)" size="small" icon="Share">分享</el-button>
                <el-button @click="likeMessage(index)" size="small" icon="Sunny">准确</el-button>
                <el-button @click="dislikeMessage(index)" size="small" icon="Lightning">不准确</el-button>
              </div>
            </div>
          </div>
          <div v-else class="user-message-container"
            @mouseenter="handleMouseEnter('user', index)" 
            @mouseleave="handleMouseLeave('user')">
            <div class="message-bubble user-message">
              <div class="message-content user-content">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
              <!-- 新增：用户消息的交互按钮 -->
              <div class="message-actions" v-show="isHoveredUserMessage === index">
                <el-button @click="copyMessage(message.content)" size="small" icon="CopyDocument">复制</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <el-input v-model="inputMessage" type="textarea" :rows="1" :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="输入你的问题，帮你深度解答" @keydown.enter.exact.prevent="handleEnterPress" 
          @keydown.enter.shift.exact.prevent="insertLineBreak"></el-input>

        <div class="input-actions">
          <el-dropdown size="small" @command="handleModelCommand">
            <span class="chart-filter">
              {{ modelSelectData.period }} <el-icon>
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(item, index) in modelSelectData.periodOptions" :key="index" :command="item">
                  {{ item }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 新增深度思考按钮 -->
          <el-tooltip content="深度思考" placement="top">
            <el-button 
              class="action-btn" 
              :class="{ 'deep-thinking-active': isDeepThinking }"
              @click="toggleDeepThinking">
              <el-icon><Opportunity /></el-icon>
            </el-button>
          </el-tooltip>
          <!-- 结束新增 -->

          <el-tooltip content="上传文件" placement="top">
            <el-button class="action-btn" @click="uploadFile">
              <el-icon>
                <Paperclip />
              </el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="发送" placement="top">
            <el-button class="action-btn send-btn" :disabled="!inputMessage.trim()" @click="sendMessage">
              <el-icon>
                <Position />
              </el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="suggestions" v-if="showSuggestionBtn">
        <el-button v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-btn" size="small"
          :class="{ 'active': router.currentRoute.value.query.type ===  suggestion.type}"
          @click="selectSuggestion(index)">
          <el-icon class="suggestion-icon">
            <component 
              :is="typeof suggestion.icon === 'string' && suggestion.icon.startsWith('data:image') ? 'img' : suggestion.icon" 
              :src="typeof suggestion.icon === 'string' && suggestion.icon.startsWith('data:image') ? suggestion.icon : undefined"
              :class="{ 'custom-icon': typeof suggestion.icon === 'string' && suggestion.icon.startsWith('data:image') }"
            />
          </el-icon>
          {{ suggestion.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import {
  ArrowDown, Monitor, Paperclip, Position, Opportunity
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { DihService } from '@/service/api'
import { useRouter } from 'vue-router'
import { generateUUID } from '@/utils/util-common'
import {getCurrentFormattedDate} from '@/utils/util-time'
import { marked } from 'marked';
import BaseChart from '@/components/echarts/base-chart.vue';

// Set marked.js global options for markdown parsing
marked.setOptions({
  gfm: true,
  breaks: true
});

const router = useRouter();

// 定义消息接口
interface Message {
  sender: 'user' | 'ai'
  content: string
  time: string
  type?: 'text' | 'chart' // 消息类型
  chartData?: any // 可选的图表数据
  loading?: boolean // 是否正在加载
}

// 定义基础信息接口
interface BasicInfo {
  label: string
  value: string
}

// 定义调查结果接口
interface InvestigationResult {
  title: string
  time: string
}

// 定义任务接口
interface Task {
  title: string
  detail: string
  expanded: boolean
}

// 定义建议接口
interface Suggestion {
  type: string
  label: string
  icon: any
}

interface Props {
  suggestions: Suggestion[]
  chatSessionId?: string
  chatSessionType?: string
}

const props = defineProps<Props>()

// 添加深度思考状态
const isDeepThinking = ref(false)

// 定义选择框结构
interface SelectData {
  period: string
  periodOptions: string[]
}

// 输入消息
const inputMessage = ref('')

// 添加一个变量来跟踪Enter按键次数
const enterPressCount = ref(0)
const enterPressTimer = ref<number | null>(null)
// 移除了 showEnterTip 变量，因为我们不再使用页面内元素显示提示

// 面板展开状态
const panelStates = reactive({
  main: true,
  info: true,
  tasks: true
})

// 基础信息数据
const basicInfo = ref<BasicInfo[]>([
  { label: '源IP', value: '10.108.108.23' },
  { label: '目的IP', value: '10.106.108.110' },
  { label: '目的端口', value: '8080' },
  { label: '进程命令行', value: 'c:\\windows\\temp\\frpc.exe -c c:\\windows\\temp\\frpc.toml' }
])

// 调查结果数据
const investigationResult = ref<InvestigationResult>({
  title: '调查结果1：IP地址10.108.108.23在短时间内高频（11次）向目标主机的one.jsp文件发起POST请求，可能存在利用WebShell执行命令或传输恶意数据的行为，需要调查该IP的网络行为是否为攻击源。',
  time: '调查时间：2025-04-18 16:00:00 - 2025-04-18 20:00:00'
})

// 任务数据
const tasks = ref<Task[]>([
  {
    title: '分析主机c39842ce43b5ebc8上的网络连接调查frpc.exe(7628)的网络连接情况，特别是到10.106.108.110:8080的连接行为',
    detail: '这里是任务1的详细信息和结果...',
    expanded: false
  },
  {
    title: '分析主机c39842ce43b5ebc8上的DNS访问调查frpc.exe(7628)请求过的DNS域名',
    detail: '这里是任务2的详细信息和结果...',
    expanded: false
  },
  {
    title: '分析主机c39842ce43b5ebc8上的进程创建调查frpc.exe(7628)创建过哪些子进程',
    detail: '这里是任务3的详细信息和结果...',
    expanded: false
  }
])

// 计算已完成任务数
const completedTasks = ref(0)

// 总任务数
const totalTasks = ref(3)


// 消息列表
const messages = ref<Message[]>([
  {
    sender: 'ai',
    content: '嘿！我是你的人工智能助手。有什么问题尽管问我吧！',
    time: getCurrentFormattedDate()
  }
])

const showSuggestionBtn = ref(true);
const chatSessionTitle = ref('新的会话');
const chatSessionId = ref('');
const chatSessionType = ref('');

/**
 * 健壮的 JSON 解析工具方法
 * 支持处理包含转义字符、双重序列化等情况的 JSON 数据
 * @param content 待解析的字符串
 * @returns 解析后的对象，失败返回 null
 */
const parseJsonContent = (content: string) => {
  if (!content) return null;
  
  let cleanContent = content.trim();
  // 0. 处理 BOM 头 (ufeff)
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }

  const tryParse = (str: string) => {
    try { return JSON.parse(str); } catch (e) { return null; }
  };

  // 方法1: 直接尝试解析
  let result = tryParse(cleanContent);
  if (result) {
    return result;
  }

  // 方法2: 尝试提取 Markdown 代码块 (```json ... ```)
  const markdownMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    result = tryParse(markdownMatch[1]);
    if (result) {
      return result;
    }
  }

  // 方法3: 尝试寻找最外层的 {} 或 [] (提取JSON子串)
  const firstBrace = cleanContent.indexOf('{');
  const lastBrace = cleanContent.lastIndexOf('}');
  const firstBracket = cleanContent.indexOf('[');
  const lastBracket = cleanContent.lastIndexOf(']');
  let start = -1; 
  let end = -1;
  // 优先匹配最外层的对象或数组
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    if (lastBrace > firstBrace) { start = firstBrace; end = lastBrace; }
  } else if (firstBracket !== -1) {
    if (lastBracket > firstBracket) { start = firstBracket; end = lastBracket; }
  }
  if (start !== -1 && end !== -1) {
    result = tryParse(cleanContent.substring(start, end + 1));
    if (result) {
      return result;
    }
  }

  // 方法4: 尝试反转义解析 (处理双重序列化)
  try {
    const unescaped = JSON.parse(cleanContent);
    if (typeof unescaped === 'string') {
      // 递归调用以处理 unescaped 字符串中的 markdown 或其他情况
      result = parseJsonContent(unescaped);
      if (result) {
          return result;
      }
    } else if (typeof unescaped === 'object' && unescaped !== null) {
      return unescaped;
    }
  } catch (e) { /* ignore */ }

  // 方法5: 尝试补充引号解析 (针对 {\"a\": 1} 这种缺少外层引号的单行内容)
  // 这比直接替换更安全，因为它遵循JSON转义规则
  // 这一步才成功
  try {
     const wrapped = '"' + cleanContent + '"';
     const unescaped = JSON.parse(wrapped);
     if (typeof unescaped === 'string') {
        result = tryParse(unescaped);
        if (result) {
            return result;
        }
     }
  } catch (e) { /* ignore */ }

  // 方法6: 暴力替换转义引号 (兼容旧逻辑 - 最后的兜底)
  try {
    const cleaned = cleanContent.replace(/\\"/g, '"');
    result = JSON.parse(cleaned);
    return result;
  } catch (e) { /* ignore */ }

  return null;
};

// 判断消息是否为chart格式并处理
const processMessageFormat = (message: Message) => {
  if (message.sender === 'ai' && message.content) {
    
    // 如果消息类型已经是 text，直接返回，不进行 JSON 解析
    if (message.type === 'text') {
      return;
    }
    
    // 如果消息类型已经是 chart，发送图表数据到右侧组件
    if (message.type === 'chart') {
      const jsonData = parseJsonContent(message.content);
      if (jsonData && jsonData.option) {
        // 发送图表数据到 view-right-inspect 组件
        window.dispatchEvent(new CustomEvent('inspectChartData', {
          detail: {
            chartType: jsonData.chart_type || 'line',
            option: jsonData.option,
            rawData: jsonData.raw_data,
            columns: jsonData.columns
          }
        }));
        // 更新消息内容为提示文本
        message.content = '图表数据已加载，请在右侧面板查看可视化结果。';
      } else {
        console.warn('processMessageFormat - jsonData 存在但没有 option 字段:', jsonData);
      }
      return;
    }
    
    const jsonData = parseJsonContent(message.content);
    // 判断是否为图表数据格式
    if (jsonData && (jsonData.option || jsonData.chart_type)) {
      message.type = 'chart';
      // 发送图表数据到 view-right-inspect 组件
      window.dispatchEvent(new CustomEvent('inspectChartData', {
        detail: {
          chartType: jsonData.chart_type || 'line',
          option: jsonData.option || jsonData,
          rawData: jsonData.raw_data,
          columns: jsonData.columns
        }
      }));
      message.content = '图表数据已加载，请在右侧面板查看可视化结果。';
    } else {
      message.type = 'text';
    }
  }
};

const getChatSession = async () => {
  // 优先使用 props 传入的参数（悬浮窗模式），否则从路由获取
  if (props.chatSessionType) {
    chatSessionType.value = props.chatSessionType;
  } else {
    const currentSessionType = router.currentRoute.value.query.type;
    chatSessionType.value = currentSessionType ? currentSessionType.toString() : 'ask';
  }
  
  // 优先使用 props 传入的 chatSessionId（悬浮窗模式）
  if (props.chatSessionId) {
    chatSessionId.value = props.chatSessionId;
  } else {
    const currentChatSessionId = router.currentRoute.value.query.chatSessionId;
    if(currentChatSessionId){
      chatSessionId.value = currentChatSessionId.toString();
    }else{
      // 参数没有传递chattSessionId
      chatSessionId.value = generateUUID();
      router.push({
      name: 'service-dih',
      query: {
        type: chatSessionType.value,
        chatSessionId: chatSessionId.value,
        createSession: 1
      }
    });
    }
  }
  
  // 获取聊天会话数据
  if (chatSessionId.value) {
    try {
      const data = await DihService.getChatSession(chatSessionId.value,{type:chatSessionType.value});
      messages.value = data.messageList;
      
      // 延迟处理消息格式，确保右侧组件已经完全挂载
      setTimeout(() => {
        messages.value.forEach(msg => {
          processMessageFormat(msg);
        });
      }, 500);

      chatSessionTitle.value = data.title || '新的会话';
    } catch (error) {
      console.error("获取聊天会话数据失败:", error);
      messages.value = [{
        sender: 'ai',
        content: '嘿！我是你的人工智能助手。有什么问题尽管问我吧！',
        time: getCurrentFormattedDate()
      }];
      chatSessionTitle.value = '新的会话';
    }
  } else {
    messages.value = [{
        sender: 'ai',
        content: '嘿！我是你的人工智能助手。有什么问题尽管问我吧！',
        time: getCurrentFormattedDate()
      }];
    chatSessionTitle.value = '新的会话';
  }

  showSuggestionBtn.value = messages.value.length <= 1;
};



onMounted(() => {
  getChatSession();
  // 获取模型列表
  fetchModelList();
});

// 监听路由参数chatSessionId的变化
watch(
  () => router.currentRoute.value.query.chatSessionId,
  (newChatSessionId, oldChatSessionId) => {
    // 当chatSessionId发生变化时，重新获取聊天会话
    getChatSession();
  }
);

const fetchModelList = async () => {
  try {
    const modelList = await DihService.getModelList();
    if (modelList && modelList.length > 0) {
      modelSelectData.value.periodOptions = modelList.map(modelInfo => modelInfo.model);
      modelSelectData.value.period = modelList[0].model;
    }
  } catch (error) {
  }
};

// 监听query参数的变化
watch(
  () => router.currentRoute.value.query,
  (newQuery, oldQuery) => {
    inputMessage.value = newQuery.msg ? decodeURIComponent(newQuery.msg.toString()) : ''
  },
  // 首次进入组件时也执行一次
  { immediate: true }     
)

// 切换深度思考模式
const toggleDeepThinking = () => {
  isDeepThinking.value = !isDeepThinking.value
}

// 处理Enter按键
const handleEnterPress = () => {
  enterPressCount.value++
  
  // 如果这是第一次按下Enter，启动计时器
  if (enterPressCount.value === 1) {
    enterPressTimer.value = window.setTimeout(() => {
      // 如果在300ms内没有再次按下Enter，则重置计数器
      enterPressCount.value = 0
      insertLineBreak();
      // 显示 toast 提示信息
      ElMessage({
        message: '快速按下两次Enter发送消息',
        type: 'info',
        duration: 2000
      });
    }, 300)
  } 
  // 如果这是第二次按下Enter，在300ms内
  else if (enterPressCount.value === 2) {
    // 清除计时器
    if (enterPressTimer.value) {
      clearTimeout(enterPressTimer.value)
      enterPressTimer.value = null
    }
    
    // 重置计数器
    enterPressCount.value = 0
    
    // 发送消息
    sendMessage()
  }
}

// 插入换行符
const insertLineBreak = () => {
  const textarea = document.querySelector('.input-container textarea') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = inputMessage.value
    inputMessage.value = text.substring(0, start) + '\n' + text.substring(end)
    
    // 在下一次DOM更新后设置光标位置
    nextTick(() => {
      textarea.selectionStart = start + 1
      textarea.selectionEnd = start + 1
    })
  }
}

// 发送消息
const sendMessage = async () => {
  if (inputMessage.value.trim()) {
    // 清空输入框 
    var sendMessage = inputMessage.value.trim();
    inputMessage.value = ''
    // 添加用户消息
    messages.value.push({
      sender: 'user',
      content: sendMessage,
      time: getCurrentFormattedDate(),
    })

    // 添加AI回复占位消息
    const aiMessageIndex = messages.value.length;
    messages.value.push({
      sender: 'ai',
      content: '',
      time: getCurrentFormattedDate(),
      loading: true,
    })

    
    try {
      // 调用聊天接口
      const reader = await DihService.chat({
        type: chatSessionType.value,
        message: sendMessage,
        model: modelSelectData.value.period,
        deep_think: isDeepThinking.value,
        chat_id: chatSessionId.value, // 使用正确的chatSessionId
      });

      if (!reader) {
        messages.value[aiMessageIndex].loading = false;
        messages.value[aiMessageIndex].content = '抱歉，回复失败，请稍后重试~';
        return;
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;
      let accumulatedContent = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          if (messages.value[aiMessageIndex].loading) {
            messages.value[aiMessageIndex].loading = false;
          }

          // 检查是否为 agent_inspect 类型并包含图表数据
          if (chatSessionType.value === 'agent_inspect') {
            // 使用组件级别的 parseJsonContent 工具方法
            const jsonData = parseJsonContent(accumulatedContent);
            // 如果返回数据包含 option 字段，则为图表数据
            if (jsonData && jsonData.option) {
              // 发送图表数据到 view-right-inspect 组件
              window.dispatchEvent(new CustomEvent('inspectChartData', {
                detail: {
                  chartType: jsonData.chart_type || 'line',
                  option: jsonData.option,
                  rawData: jsonData.raw_data,
                  columns: jsonData.columns
                }
              }));
              // 显示简要说明而不是原始 JSON
              messages.value[aiMessageIndex].content = '图表数据已加载，请在右侧面板查看可视化结果。';
            } else {
              messages.value[aiMessageIndex].content = accumulatedContent;
            }
          } else {
            messages.value[aiMessageIndex].content = accumulatedContent;
          }

          // 强制更新DOM
          await nextTick();
        }
      }
      
      // 判断是否为新聊天会话
      const isNewChat = router.currentRoute.value.query.createSession;
      // 如果是新聊天且至少有一条完整的消息交互，则添加到聊天列表
      if (isNewChat && messages.value.length >= 2) {
        // 创建新的聊天记录项
        const newChatItem = {
          id: chatSessionId.value,
          type: chatSessionType.value,
          sessionId: chatSessionId.value,
          title: sendMessage.substring(0, 20) + (sendMessage.length > 20 ? '...' : ''), // 使用前20个字符作为标题
          pin: false
        };
        // 触发事件通知父组件添加新的聊天项
        // 这里可以通过emit或者其他方式通知view-left组件
        window.dispatchEvent(new CustomEvent('newChatCreated', { 
          detail: { chatItem: newChatItem } 
        }));
      }
    } catch (error) {
      console.error('聊天接口调用失败:', error);
      messages.value[aiMessageIndex].loading = false;
      messages.value[aiMessageIndex].content = '抱歉，回复失败，请稍后重试~';
    }
  }
}

// 切换任务折叠状态
const toggleTask = (index: number) => {
  tasks.value[index].expanded = !tasks.value[index].expanded
}

// 切换面板展开状态
const togglePanel = (panelName: string) => {
  // @ts-ignore
  panelStates[panelName] = !panelStates[panelName]
}

// 展开更多信息
const expandInfo = () => {
}

// 可选择的模型
const modelSelectData = ref<SelectData>({
  periodOptions: ['qianwen-max', 'deepseek-R1', 'deepseek-V3'],
  period: 'qianwen-max',
})

const handleModelCommand = (command: string) => {
  modelSelectData.value.period = command
}


// 上传文件
const uploadFile = () => {
  // 创建文件输入元素
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  fileInput.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      // 调用上传接口
      DihService.uploadFile(file).then(res => {
        // 添加系统消息提示
        messages.value.push({
          sender: 'ai',
          content: `文件 "${file.name}" 上传成功！`,
          time: new Date().toLocaleString()
        });
      }).catch(err => {
        console.error('文件上传失败', err);
        // 添加系统消息提示
        messages.value.push({
          sender: 'ai',
          content: `文件 "${file.name}" 上传失败，请重试！`,
          time: new Date().toLocaleString()
        });
      });
    }
  };
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
}

// 选择建议
const selectSuggestion = (index: number) => {
  const suggestion = props.suggestions[index]
  
  // 如果点击的是xx开启新的chatSession
  if (suggestion.type) {
    chatSessionId.value = generateUUID();
    router.push({
    name: 'service-dih',
    query: {
      type: suggestion.type,
      chatSessionId: chatSessionId.value,
      createSession: 1
    }
  });
}
}

const isHoveredAiMessage = ref(-1);
const isHoveredUserMessage = ref(-1);

// 处理鼠标悬停事件
const handleMouseEnter = (type: string, index: number) => {
  if (type === 'ai') {
    isHoveredAiMessage.value = index;
  } else {
    isHoveredUserMessage.value = index;
  }
};

const handleMouseLeave = (type: string) => {
  if (type === 'ai') {
    isHoveredAiMessage.value = -1;
  } else {
    isHoveredUserMessage.value = -1;
  }
};

// 复制消息到剪贴板
const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content).then(() => {
  }, () => {
  });
};

// 分享消息（示例）
const shareMessage = (content: string) => {
  // 显示 toast 提示信息
      ElMessage({
        message: '当前用户暂不支持分享',
        type: 'info',
        duration: 2000
      });
};

// 点赞消息
const likeMessage = (index: number) => {
};

// 点踩消息
const dislikeMessage = (index: number) => {
};

// 添加解析Markdown的方法
const parseMarkdown = (content: string) => {
  return marked.parse(content);
};
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  box-shadow: var(--el-border-color-light) 0px 0px 10px;
  position: relative;
  overflow: hidden;
}

/* 抽屉触发器样式 */
.drawer-trigger {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: var(--el-color-primary);
  color: white;
  padding: 5px 15px;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.drawer-trigger .el-icon {
  transition: transform 0.3s;
}

/* 自定义抽屉样式 */
.custom-drawer {
  position: absolute;
  top: -100%;
  /* 初始位置在容器外部上方 */
  left: 0;
  width: 100%;
  height: 100%;
  /* 填充满整个父容器的高度 */
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 5;
  transition: top 0.3s ease;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.custom-drawer.drawer-open {
  top: 0;
  /* 打开时移动到容器顶部 */
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
  /* 防止头部被压缩 */
}

.drawer-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
  /* 内容区域自动填充剩余空间 */
}

/* 面板容器 */
.panels-container {
  height: 100%;
  position: relative;
  z-index: 1;
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

.left-panel {
  background-color: #f5f7fa;
  margin-left: 0;
  padding: 10px;
  overflow-y: auto;
}

.center-panel {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.right-panel {
  background-color: #f5f7fa;
  color: #333;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 左侧面板聊天列表样式 */
.chat-action {
  margin-bottom: 15px;
  width: 100%;
}

.new-chat-btn {
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  background-color: white;
  width: 100%;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.btn-icon {
  display: flex;
  align-items: left;
}

.btn-text {
  flex-grow: 1;
  text-align: center;
  margin: 0 10px;
}

.btn-shortcut {
  display: flex;
  align-items: center;
}

.shortcut-key {
  background-color: #f2f2f2;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.chat-history {
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  padding-left: 5px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chat-item {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-item:hover {
  background-color: #e9ecef;
}

.chat-item.active {
  background-color: #e6f1fc;
}

.chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-actions {
  display: none;
}

.chat-item:hover .chat-actions,
.chat-item.active .chat-actions {
  display: block;
}

.more-btn {
  padding: 2px;
  font-size: 16px;
  color: #909399;
}

.more-btn:hover {
  color: #606266;
}

:deep(.el-dropdown-menu__item.delete-item) {
  color: #f56c6c;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 5px;
}

.view-all {
  text-align: center;
  color: #409eff;
  font-size: 14px;
  margin-top: 10px;
  cursor: pointer;
  padding: 5px;
}

.view-all:hover {
  text-decoration: underline;
}

.center-header {
  text-align: center;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.center-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.enter-tip {
  text-align: center;
  padding: 5px;
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  margin: 10px auto;
  width: fit-content;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.input-area {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
}

.input-container {
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #fff;
}

.input-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-textarea__inner) {
  border: none;
  padding: 12px 100px 12px 12px;
  resize: none;
  box-shadow: none;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.input-actions {
  position: absolute;
  right: 10px;
  bottom: 8px;
  display: flex;
  gap: 5px;
}

.action-btn {
  border: none;
  background: transparent;
  padding: 4px;
  color: #909399;
}

.deep-thinking-active {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.action-btn:hover {
  color: #606266;
}

.send-btn {
  color: #409eff;
}

.send-btn:hover {
  color: #66b1ff;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.suggestion-btn {
  border-radius: 20px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #606266;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.suggestion-btn:hover {
  background-color: #e9ecef;
  color: #409eff;
}

.suggestion-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.suggestion-icon {
  margin-right: 5px;
  width: 1em;
  height: 1em;
}

.custom-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #333;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.collapse-btn {
  color: #909399;
}

.info-card {
  margin: 12px;
  background-color: rgb(137, 137, 143);
  border-radius: 6px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #a9a3a3;
  font-size: 14px;
}

.card-header .el-icon {
  margin-right: 8px;
}

.card-content {
  padding: 12px 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-label {
  width: 100px;
  color: rgb(0, 0, 0);
}

.info-value {
  flex: 1;
  word-break: break-all;
}

.expand-btn {
  color: #409eff;
  padding: 0;
  font-size: 14px;
  margin-top: 8px;
}

.task-result {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}

.result-title {
  margin: 0 0 8px;
  line-height: 1.5;
}

.result-time {
  margin: 0;
  color: rgb(32, 95, 222);
  font-size: 12px;
}

.task-item {
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.task-header {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: rgb(121, 118, 118);
  cursor: pointer;
}

.task-icon {
  color: #409eff;
  margin-right: 8px;
  margin-top: 2px;
}

.task-title {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
}

.task-arrow {
  margin-left: 8px;
}

.task-arrow .is-rotate {
  transform: rotate(180deg);
}

.task-detail {
  padding: 12px;
  color: rgb(242, 244, 247);
  background-color: rgb(55, 59, 64);
  font-size: 14px;
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

/* 可视化面板样式 */
.visualization-container {
  margin: 12px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.visualization-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.visualization-header h4 {
  margin: 0;
  font-size: 16px;
}

.visualization-content {
  padding: 20px;
  min-height: 200px;
}

.placeholder-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #909399;
}

.placeholder-chart .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
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
  padding: 4px;
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


.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.message-item {
  display: flex;
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.user-message {
  background-color: #e6f1fc;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.ai-message {
  background-color: #f5f7fa;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.user-message-container {
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
}

.ai-message-container {
  display: flex;
  width: 100%;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
}

.ai-avatar {
  background-color: #409eff;
  color: white;
}

.message-content {
  margin: 0;
  font-size: 14px;
  color: #303133;
}

/* 添加用户消息内容样式，支持换行 */
.user-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 添加Markdown内容样式 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body::before {
  display: table;
  content: "";
}

.markdown-body::after {
  display: table;
  clear: both;
  content: "";
}

.markdown-body>*:first-child {
  margin-top: 0 !important;
}

.markdown-body>*:last-child {
  margin-bottom: 0 !important;
}

.markdown-body a {
  color: #409eff;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body a:active,
.markdown-body a:hover {
  outline-width: 0;
}

.markdown-body strong {
  font-weight: 600;
}

.markdown-body h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

.markdown-body h2 {
  font-size: 1.5em;
  margin: 0.83em 0;
}

.markdown-body h3 {
  font-size: 1.25em;
  margin: 1em 0;
}

.markdown-body h4 {
  font-size: 1em;
  margin: 1.33em 0;
}

.markdown-body h5 {
  font-size: 0.875em;
  margin: 1.67em 0;
}

.markdown-body h6 {
  font-size: 0.85em;
  color: #6a737d;
  margin: 2em 0;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body ul ul,
.markdown-body ul ol,
.markdown-body ol ol,
.markdown-body ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body li {
  word-wrap: break-all;
}

.markdown-body li>p {
  margin-top: 16px;
}

.markdown-body li+li {
  margin-top: 0.25em;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.markdown-body pre {
  word-wrap: normal;
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
}

.markdown-body pre code {
  background: transparent;
  word-break: normal;
  overflow-wrap: normal;
}

.markdown-body pre code,
.markdown-body pre tt {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

.markdown-body hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
}

.markdown-body td,
.markdown-body th {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body th {
  font-weight: 600;
}

.markdown-body tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-body tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}

/* 确保AI消息容器中的Markdown内容样式正确应用 */
.ai-message .message-content {
  color: #303133;
  background-color: transparent;
}

/* 确保AI消息容器中的Markdown内容样式正确应用 */
.ai-message .markdown-body {
  color: #303133;
  background-color: transparent;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.message-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateY(100%);
  background-color: rgba(255, 255, 255, 0.3);
  padding: 4px;
  border-radius: 4px;
  z-index: 10;
}

.message-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  background: transparent;
}

.message-actions .el-button:hover {
  background-color: #f2f6fc;
}

/* 图表消息样式 */
.message-chart {
  width: 100%;
  min-height: 200px;
  background-color: #fff;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
}

/* 打字机动画效果 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  height: 24px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #909399;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
