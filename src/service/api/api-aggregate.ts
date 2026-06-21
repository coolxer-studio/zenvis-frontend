import { request } from '@/service/request-wrapper';
import {
  TGetMsgTagParams,
  TMsgTagResponse,
  TGetMsgTrendParams,
  TMsgTrendResponse,
  TGetMsgListParams,
  TMsgListResponse,
  TGetEntryListParams,
  TEntryListResponse,
} from "@/types/type-device";

const prefix = '/api/v1/retrieval/aggregate';

export class AggregateService {
  static async getMsgTag(params: TGetMsgTagParams): Promise<TMsgTagResponse> {
    return request<TMsgTagResponse>(`${prefix}/msg/tag`, params, 'GET');
  }

  static async getMsgTrend(params: TGetMsgTrendParams): Promise<TMsgTrendResponse> {
    return request<TMsgTrendResponse>(`${prefix}/msg/trend`, params, 'GET');
  }

  static async getMsgList(params: TGetMsgListParams): Promise<TMsgListResponse> {
    return request<TMsgListResponse>(`/api/v1/entity/${params.entity_name}/list`, params, 'GET');
  }

  static async getEntryList(params: TGetEntryListParams): Promise<TEntryListResponse> {
    return request<TEntryListResponse>(`/api/v1/entity/${params.entity_name}/list`, params, 'GET');
  }
}
