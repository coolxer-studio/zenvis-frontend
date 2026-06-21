import { request } from '../request-wrapper';
import {
  ChatSession,
  ModelInfo,
  UploadFileResponse,
  SuggestParams,
  ChatParams,
  ChatSessionPageParams,
  UpdateChatSessionParams,
  UpdateChatSessionResponse,
  DeleteChatSessionResponse,
  GetChatSessionParams,
} from '@/types/type-dih';

const prefix = '/api/v1/dih';

const prefixChatSession = '/api/v1/dih/chat-session';

export class DihService {
  /**
   * 上传文件接口
   * @param file 文件对象
   * @returns 上传结果
   */
  static async uploadFile(file: File): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return request<UploadFileResponse>(`${prefix}/upload`, formData, 'POST');
  }

  /**
   * 获取建议接口
   * @param params 参数
   * @returns 建议结果
   */
  static async suggest(params: SuggestParams): Promise<string> {
    return request<string>(`${prefix}/suggest`, params, 'POST');
  }

  /**
   * 聊天接口
   * @param params 聊天参数
   * @returns 流式响应
   */
  static async chat(params: ChatParams): Promise<ReadableStreamDefaultReader<Uint8Array> | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || ''}${prefix}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok || !response.body) {
        return null;
      }

      return response.body.getReader();
    } catch (error) {
      console.error('聊天接口调用失败:', error);
      return null;
    }
  }

  static async getModelList(): Promise<ModelInfo[]> {
    const response = await request<Array<object>>(`${prefix}/model/list`, '', 'GET');
    // 返回ModelInfo[]对象
    return response.map((item) => ({
      model: (item as any).model || '',
      desc: (item as any).desc || '',
    }));
  }

  static async getChatSessionForPin(): Promise<ChatSession[]> {
    const response = await request<Array<object>>(`${prefixChatSession}/list/pin`, '', 'GET');
    // 返回ChatSession[]对象
    return response.map((item) => ({
      id: (item as any).id || '',
      sessionId: (item as any).session_id || '',
      title: (item as any).title || '',
      type: (item as any).type || '',
      messageList: (item as any).message_list || [],
      deepThink: (item as any).deep_think || false,
      onlineSearch: (item as any).online_search || false,
      updateTime: (item as any).update_time || '',
      pin: (item as any).pin || false,
    }));
  }

  static async getChatSessionPageList(params: ChatSessionPageParams): Promise<ChatSession[]> {
    const response = await request<{ rows: object[] }>(`${prefixChatSession}/list`, params, 'GET');
    // 返回ChatSession[]对象
    return response.rows.map((item) => ({
      id: (item as any).id || '',
      sessionId: (item as any).session_id || '',
      title: (item as any).title || '',
      type: (item as any).type || '',
      messageList: (item as any).message_list || [],
      deepThink: (item as any).deep_think || false,
      onlineSearch: (item as any).online_search || false,
      updateTime: (item as any).update_time || '',
      pin: (item as any).pin || false,
    }));
  }

  static async updateChatSession(id: string, params: UpdateChatSessionParams): Promise<UpdateChatSessionResponse> {
    return request<UpdateChatSessionResponse>(`${prefixChatSession}/${id}/update`, params);
  }

  static async deleteChatSession(id: string): Promise<DeleteChatSessionResponse> {
    return request<DeleteChatSessionResponse>(`${prefixChatSession}/${id}`, '', 'DELETE');
  }

  static async getChatSession(chatSessionId: string, params: GetChatSessionParams): Promise<ChatSession> {
    const response = await request<Object>(`${prefixChatSession}/${chatSessionId}/session`, params, 'GET');
    return {
      id: (response as any).id || '',
      sessionId: (response as any).session_id || '',
      title: (response as any).title || '',
      type: (response as any).type || '',
      messageList: (response as any).message_list || [],
      deepThink: (response as any).deep_think || false,
      onlineSearch: (response as any).online_search || false,
      updateTime: (response as any).update_time || '',
      pin: (response as any).pin || false,
    };
  }
}