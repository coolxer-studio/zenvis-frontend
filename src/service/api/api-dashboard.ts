import { request } from '@/service/request-wrapper';
import {
  TSpeedStatResponse,
  TDeviceStatResponse,
  TMsgTrendResponse,
  TGetMsgTrend,
  TGetLocationStat,
  TGetDeviceStat,
  TSystemStatusResponse,
  TGetSystemSummary,
  TSystemSummaryResponse,
  TSystemEfficiencyResponse,
  TSystemRealInfoResponse,
} from '@/types/type-dashboard';

const prefix = '/api/v1/dashboard/home';

export class HomeService {
  static async getSpeedStat(): Promise<TSpeedStatResponse> {
    return request<TSpeedStatResponse>(`${prefix}/speed-stat`);
  }

  static async getLocationStat(params: TGetLocationStat): Promise<TDeviceStatResponse> {
    return request<TDeviceStatResponse>(`${prefix}/province-city-stat`, params);
  }

  static async getDeviceStat(params: TGetDeviceStat): Promise<TDeviceStatResponse> {
    return request<TDeviceStatResponse>(`${prefix}/manufacture-system-stat`, params);
  }

  static async getMsgTrend(params: TGetMsgTrend): Promise<TMsgTrendResponse> {
    return request<TMsgTrendResponse>(`${prefix}/msg-trend`, params);
  }

  static async getSystemStatus(): Promise<TSystemStatusResponse> {
    return request<TSystemStatusResponse>(`${prefix}/status`);
  }

  static async getSystemSummary(params: TGetSystemSummary): Promise<TSystemSummaryResponse> {
    return request<TSystemSummaryResponse>(`${prefix}/summary`, params);
  }

  static async getSystemEfficiency(): Promise<TSystemEfficiencyResponse> {
    return request<TSystemEfficiencyResponse>(`${prefix}/efficiency`);
  }

  static async getSystemRealInfo(): Promise<TSystemRealInfoResponse> {
    return request<TSystemRealInfoResponse>(`${prefix}/real-info`);
  }
}
