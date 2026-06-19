interface Message {
  sender: 'user' | 'ai'
  content: string
  time: string
  iframe?: string
}

export type ChatSession = {
  id: number;
  sessionId: string;
  title: string;
  type: string;
  messageList: Message[];
  deepThink: boolean;
  onlineSearch: boolean;
  updateTime: string;
  pin: boolean;
};

export type ModelInfo = {
  model: string;
  desc: string;
};

// 上传文件响应
export type UploadFileResponse = {
  success: boolean;
  file_id?: string;
  file_name?: string;
  file_path?: string;
  message?: string;
};

// 建议请求参数
export type SuggestParams = {
  query: string;
  context?: string;
  limit?: number;
};

// 聊天请求参数
export type ChatParams = {
  session_id: string;
  message: string;
  model?: string;
  deep_think?: boolean;
  online_search?: boolean;
  context?: string[];
};

// 聊天会话分页列表参数
export type ChatSessionPageParams = {
  page?: number;
  size?: number;
  type?: string;
  keyword?: string;
};

// 更新聊天会话参数
export type UpdateChatSessionParams = {
  title?: string;
  pin?: boolean;
  deep_think?: boolean;
  online_search?: boolean;
};

// 更新聊天会话响应
export type UpdateChatSessionResponse = {
  success: boolean;
  message?: string;
};

// 删除聊天会话响应
export type DeleteChatSessionResponse = {
  success: boolean;
  message?: string;
};

// 获取聊天会话参数
export type GetChatSessionParams = {
  session_id?: string;
};