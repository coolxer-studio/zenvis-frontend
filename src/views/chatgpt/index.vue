<template>
  <div class="chatgpt-container">
    <!-- 左侧会话管理 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>会话管理</h2>
        <el-button type="primary" size="small" @click="createNewSession">
          <el-icon><Plus /></el-icon>
          新建会话
        </el-button>
      </div>
      <div class="session-list">
        <div
          v-for="session in sessionList"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="selectSession(session.id)"
        >
          <div class="session-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="session-info">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-time">{{ session.time }}</div>
          </div>
          <el-dropdown trigger="click" @command="handleSessionCommand($event, session.id)">
            <el-icon class="session-more"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="main-chat">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">{{ currentSession?.title || '新会话' }}</div>
        <div class="chat-actions">
          <el-button size="small" @click="toggleThinking">
            <el-icon><HelpFilled /></el-icon>
            思维链 {{ showThinking ? '开' : '关' }}
          </el-button>
          <el-button size="small" @click="clearMessages">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesRef">
        <!-- 消息气泡列表 -->
        <div v-if="messages.length > 0" class="message-list">
          <div v-for="(item, index) in messages" :key="index" class="message-item">
            <!-- AI 消息 -->
            <div v-if="item.role === 'ai'" class="ai-message-container"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = -1">
              <div class="avatar ai-avatar">
                <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="AI">
              </div>
              <div class="message-bubble ai-message">
                <!-- 思维链展示 -->
                <div v-if="showThinking && item.thinking" class="thinking-section">
                  <div class="thinking-header" @click="toggleThinkingExpand(index)">
                    <el-icon><Loading /></el-icon>
                    <span>思考中...</span>
                    <el-icon><CaretBottom v-if="!expandedThinking[index]" /><CaretTop v-else /></el-icon>
                  </div>
                  <div v-if="expandedThinking[index]" class="thinking-content">
                    {{ item.thinking }}
                  </div>
                </div>
                <!-- 加载动画 -->
                <div v-if="item.loading" class="typing-indicator">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
                <!-- 消息内容 -->
                <div v-else class="message-content">{{ item.content }}</div>
                <div class="message-time">{{ item.time }}</div>
                <!-- 操作按钮 -->
                <div class="message-actions" v-show="hoveredIndex === index">
                  <el-button size="small" :icon="Refresh" circle @click="refreshMessage(index)" />
                  <el-button size="small" :icon="Search" circle @click="searchRelated(index)" />
                  <el-button size="small" :icon="Star" circle @click="likeMessage(index)" />
                  <el-button size="small" :icon="DocumentCopy" circle @click="copyMessage(item.content)" />
                </div>
              </div>
            </div>
            <!-- 用户消息 -->
            <div v-else class="user-message-container">
              <div class="message-bubble user-message">
                <div class="message-content">{{ item.content }}</div>
                <div class="message-time">{{ item.time }}</div>
              </div>
              <div class="avatar user-avatar">
                <img src="https://avatars.githubusercontent.com/u/76239030?v=4" alt="User">
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <el-icon :size="64"><ChatLineRound /></el-icon>
          </div>
          <div class="empty-text">开始一个新对话</div>
          <div class="empty-hint">输入消息开始对话，或选择以下示例开始</div>
          <!-- 对话示例列表 -->
          <div class="examples-list">
            <div
              v-for="(example, idx) in examples"
              :key="idx"
              class="example-item"
              @click="startExample(example)"
            >
              <div class="example-icon">
                <el-icon :size="20"><Compass /></el-icon>
              </div>
              <div class="example-content">
                <div class="example-title">{{ example.title }}</div>
                <div class="example-desc">{{ example.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-wrapper">
          <el-input
            v-model="inputContent"
            type="textarea"
            :rows="3"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="输入消息，Enter发送，Shift+Enter换行..."
            resize="none"
            @keydown.enter.exact.prevent="handleSend"
          />
          <div class="input-actions">
            <el-tooltip content="上传图片">
              <el-button size="small" @click="uploadImage">
                <el-icon><Picture /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="上传文件">
              <el-button size="small" @click="uploadFile">
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-tooltip>
            <el-button
              type="primary"
              size="small"
              :disabled="!inputContent.trim()"
              @click="handleSend"
            >
              <el-icon><Position /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus, ChatDotRound, MoreFilled, Delete, HelpFilled, Picture,
  Upload, Position, ChatLineRound, User, Loading, CaretBottom, CaretTop,
  Compass, Refresh, Search, Star, DocumentCopy
} from '@element-plus/icons-vue';

// 会话类型
interface ChatSession {
  id: string;
  title: string;
  time: string;
  messages: ChatMessage[];
}

// 消息类型
interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  thinking?: string;
  time: string;
  loading?: boolean;
}

// 示例对话类型
interface Example {
  title: string;
  description: string;
  userMessage: string;
  aiThinking: string;
  aiContent: string;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 格式化时间
const formatTime = () => {
  const now = new Date();
  return now.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 会话列表
const sessionList = reactive<ChatSession[]>([
  {
    id: '1',
    title: '关于Vue3的讨论',
    time: '今天 10:30',
    messages: []
  },
  {
    id: '2',
    title: 'TypeScript问题解答',
    time: '昨天 15:20',
    messages: []
  }
]);

// 对话示例
const examples: Example[] = [
  {
    title: '代码助手',
    description: '帮我写一个快速排序算法',
    userMessage: '帮我写一个快速排序算法，用JavaScript实现',
    aiThinking: '用户需要快速排序算法，我来分析：\n\n1. 选择基准元素\n2. 分区操作\n3. 递归排序左右两部分\n4. 时间复杂度O(n log n)',
    aiContent: '好的，我来为你实现快速排序算法：\n\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  \n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const middle = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  \n  return [...quickSort(left), ...middle, ...quickSort(right)];\n}\n\n// 测试\nconst arr = [3, 6, 8, 1, 4, 9, 2];\nconsole.log(quickSort(arr)); // [1, 2, 3, 4, 6, 8, 9]\n\n这个实现使用了经典的分治策略，平均时间复杂度是 O(n log n)。'
  },
  {
    title: '文档解析',
    description: '解释什么是RESTful API',
    userMessage: '解释什么是RESTful API，它有什么特点？',
    aiThinking: '用户想了解RESTful API概念，我需要：\n\n1. 解释REST架构风格\n2. 列举RESTful特点\n3. 给出HTTP方法对应关系\n4. 举例说明',
    aiContent: 'RESTful API 简介\n\nREST（Representational State Transfer）是一种架构风格，RESTful 是遵循这种架构的 API 设计规范。\n\n核心特点：\n\n1. 无状态 - 每个请求包含所有必要信息\n2. 资源导向 - 用URL表示资源\n3. 统一接口 - 使用标准HTTP方法\n4. 分层系统 - 客户端不知道请求是否直达终点\n\nHTTP方法对应：\n- GET: 获取资源\n- POST: 创建资源\n- PUT: 更新资源\n- DELETE: 删除资源'
  },
  {
    title: '数据分析',
    description: '分析这份销售数据',
    userMessage: '分析一下季度销售数据：Q1=100万，Q2=120万，Q3=80万，Q4=150万',
    aiThinking: '用户提供季度销售数据，我需要：\n\n1. 计算环比增长率\n2. 分析趋势\n3. 找出异常点\n4. 提出建议',
    aiContent: '销售数据分析报告\n\n数据概览：\n- Q1: 100万（基准）\n- Q2: 120万（环比 +20%）\n- Q3: 80万（环比 -33%）\n- Q4: 150万（环比 +87%）\n\n关键发现：\n\n1. Q3出现明显下滑，销量骤降33%\n2. Q4强劲复苏，年底增长87%\n\n建议：\n1. 深入分析Q3下滑原因\n2. 保持Q4增长势头\n3. 建立销量预警机制'
  },
  {
    title: '旅行规划',
    description: '推荐杭州三日游',
    userMessage: '我要去杭州玩三天，有什么推荐行程吗？',
    aiThinking: '用户需要杭州三日游建议，我来规划：\n\nDay1: 西湖精华\nDay2: 文化之旅\nDay3: 自然风光',
    aiContent: '杭州三日游攻略\n\nDay 1 - 西湖精华\n- 上午：断桥残雪 → 白堤 → 平湖秋月\n- 下午：苏堤春晓 → 花港观鱼 → 雷峰塔\n- 晚上：湖滨步行街\n\nDay 2 - 文化探索\n- 上午：灵隐寺\n- 下午：龙井问茶\n- 晚上：南宋御街\n\nDay 3 - 自然风光\n- 方案A：千岛湖一日游\n- 方案B：西溪湿地\n\n必吃美食：东坡肉、西湖醋鱼、龙井虾仁'
  },
  {
    title: '创意写作',
    description: '写一篇科技公司新年贺词',
    userMessage: '帮我写一篇科技公司新年贺词，要提到AI发展趋势，激励员工创新',
    aiThinking: '用户需要新年贺词，需要包含：\n\n1. AI发展趋势\n2. 激励创新\n3. 感谢员工\n4. 展望未来',
    aiContent: '2024年新年贺词\n\n亲爱的同事们：\n\n值此辞旧迎新之际，我代表公司向全体员工致以最诚挚的新年祝福！\n\n过去一年，我们携手同心，在AI浪潮中勇立潮头。从大语言模型到多模态交互，技术边界不断被突破。\n\n新的一年，让我们：\n- 保持好奇，拥抱变化\n- 敢于试错，快速迭代\n- 协同共赢，共创未来\n\n前行路上，有你真好！\n\n祝大家新年快乐，阖家幸福！'
  },
  {
    title: '学习助手',
    description: '解释什么是Transformer',
    userMessage: '用简单的话解释什么是Transformer架构',
    aiThinking: '用户想理解Transformer，我需要：\n\n1. 用通俗比喻解释\n2. 说明核心机制\n3. 解释为什么重要',
    aiContent: 'Transformer 图解入门\n\n一句话理解：\nTransformer就像一个超级阅读助手，能同时看完一整篇文章，然后准确回答你的问题。\n\n核心机制：注意力机制\n\n传统AI是"逐字阅读"，Transformer是"一目十行"。\n\n为什么重要？\n- 横扫NLP领域：翻译、问答、总结全搞定\n- 开启大模型时代：GPT、BERT都是基于它\n- 多模态扩展：还能处理图片、音频'
  }
];

// 当前会话ID
const currentSessionId = ref('1');

// 当前会话
const currentSession = computed(() =>
  sessionList.find(s => s.id === currentSessionId.value)
);

// 当前会话消息
const messages = computed(() => currentSession.value?.messages || []);

const messagesRef = ref<HTMLElement>();

// 输入内容
const inputContent = ref('');

// 是否显示思维链
const showThinking = ref(true);

// 思维链展开状态
const expandedThinking = reactive<Record<number, boolean>>({});

// 鼠标悬停索引
const hoveredIndex = ref(-1);

// 切换思维链展开
const toggleThinkingExpand = (index: number) => {
  expandedThinking[index] = !expandedThinking[index];
};

// 创建新会话
const createNewSession = () => {
  const newSession: ChatSession = {
    id: generateId(),
    title: '新会话',
    time: formatTime(),
    messages: []
  };
  sessionList.unshift(newSession);
  currentSessionId.value = newSession.id;
};

// 开始示例对话
const startExample = (example: Example) => {
  const newSession: ChatSession = {
    id: generateId(),
    title: example.title,
    time: formatTime(),
    messages: []
  };
  sessionList.unshift(newSession);
  currentSessionId.value = newSession.id;

  const userMessage: ChatMessage = {
    role: 'user',
    content: example.userMessage,
    time: formatTime()
  };
  newSession.messages.push(userMessage);

  const aiMessage: ChatMessage = {
    role: 'ai',
    content: '',
    thinking: example.aiThinking,
    time: formatTime(),
    loading: true
  };
  newSession.messages.push(aiMessage);

  scrollToBottom();

  setTimeout(() => {
    aiMessage.loading = false;
    aiMessage.thinking = '';
    aiMessage.content = example.aiContent;
    scrollToBottom();
  }, 2000);
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
};

// 选择会话
const selectSession = (id: string) => {
  currentSessionId.value = id;
};

// 处理会话操作
const handleSessionCommand = async (command: string, sessionId: string) => {
  const session = sessionList.find(s => s.id === sessionId);
  if (!session) return;

  if (command === 'rename') {
    try {
      const { value } = await ElMessageBox.prompt('请输入新名称', '重命名会话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: session.title
      });
      session.title = value;
    } catch {
      // 用户取消
    }
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm('确定要删除这个会话吗？', '删除会话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      const index = sessionList.findIndex(s => s.id === sessionId);
      sessionList.splice(index, 1);
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = sessionList[0]?.id || '';
      }
      ElMessage.success('删除成功');
    } catch {
      // 用户取消
    }
  }
};

// 切换思维链显示
const toggleThinking = () => {
  showThinking.value = !showThinking.value;
};

// 清空消息
const clearMessages = () => {
  if (currentSession.value) {
    currentSession.value.messages = [];
  }
};

// 上传图片
const uploadImage = () => {
  ElMessage.info('图片上传功能开发中...');
};

// 上传文件
const uploadFile = () => {
  ElMessage.info('文件上传功能开发中...');
};

// 刷新消息
const refreshMessage = (index: number) => {
  ElMessage.info('重新生成回复...');
};

// 搜索相关
const searchRelated = (index: number) => {
  ElMessage.info('搜索相关内容...');
};

// 点赞消息
const likeMessage = (index: number) => {
  ElMessage.success('感谢您的反馈！');
};

// 复制消息
const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content);
  ElMessage.success('已复制到剪贴板');
};

// 处理发送
const handleSend = () => {
  const content = inputContent.value.trim();
  if (!content) return;

  const userMessage: ChatMessage = {
    role: 'user',
    content,
    time: formatTime()
  };

  if (currentSession.value) {
    currentSession.value.messages.push(userMessage);
  }

  const aiMessage: ChatMessage = {
    role: 'ai',
    content: '',
    thinking: '好的，我来仔细分析这个问题...',
    time: formatTime(),
    loading: true
  };
  if (currentSession.value) {
    currentSession.value.messages.push(aiMessage);
  }

  inputContent.value = '';
  scrollToBottom();

  setTimeout(() => {
    aiMessage.loading = false;
    aiMessage.thinking = '';
    aiMessage.content = `这是一条模拟回复。您发送的内容是："${content}"\n\n我可以帮您解答各种问题，支持：\n- 文字对话\n- 代码编写\n- 问题分析\n- 思维链展示\n\n还有什么问题吗？`;
    scrollToBottom();
  }, 2500);
};
</script>

<style lang="scss" scoped>
.chatgpt-container {
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f5f5f5;
}

.sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;

    h2 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .session-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 4px;
    transition: background 0.2s;

    &:hover {
      background: #f5f5f5;
    }

    &.active {
      background: #e6f0ff;
    }

    .session-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #4A90E2;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .session-info {
      flex: 1;
      min-width: 0;

      .session-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .session-time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }

    .session-more {
      padding: 4px;
      color: #999;
      cursor: pointer;

      &:hover {
        color: #333;
      }
    }
  }
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;

  .chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .chat-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .chat-actions {
      display: flex;
      gap: 8px;
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: #fafafa;
  }

  .chat-input {
    padding: 16px 24px 24px;
    border-top: 1px solid #e5e5e5;
    background: #fff;

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .input-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.ai-message-container {
  display: flex;
  gap: 12px;
  align-self: flex-start;
  max-width: 80%;
}

.user-message-container {
  display: flex;
  gap: 12px;
  align-self: flex-end;
  max-width: 80%;
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ai-avatar {
  background: #f0f0f0;
}

.user-avatar {
  background: #e8f4ff;
}

.message-bubble {
  padding: 12px 16px;
  line-height: 1.6;
  position: relative;
}

.ai-message {
  background: linear-gradient(to right, #fdfcfb 0%, #ffd1ab 100%);
  border-radius: 15px 15px 15px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-message {
  background: #4A90E2;
  color: #fff;
  border-radius: 15px 15px 4px 15px;
}

.message-content {
  font-size: 14px;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
  text-align: right;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.thinking-section {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 13px;

  .thinking-header {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ad6800;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: rgba(255, 215, 0, 0.1);
    }
  }

  .thinking-content {
    margin-top: 8px;
    color: #666;
    white-space: pre-wrap;
    line-height: 1.5;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-start;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  .typing-dot {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;

  .empty-icon {
    margin-bottom: 16px;
    color: #ccc;
  }

  .empty-text {
    font-size: 18px;
    font-weight: 500;
    color: #666;
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 14px;
    color: #999;
  }
}

.examples-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 24px;
  max-width: 700px;

  .example-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;

    &:hover {
      border-color: #4A90E2;
      box-shadow: 0 2px 12px rgba(74, 144, 226, 0.15);
      transform: translateY(-1px);
    }

    .example-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .example-content {
      flex: 1;
      min-width: 0;

      .example-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .example-desc {
        font-size: 12px;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>