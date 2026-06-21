import { defineStore } from 'pinia';
import type {
  TLocationStatResponse,
  TDeviceStatResponse,
  TMsgTrendResponse,
  TSystemStatusResponse,
  TSystemSummaryResponse,
  TSystemEfficiencyResponse,
  TSystemRealInfoResponse,
} from '@/types/type-dashboard';

interface DashboardState {
  // 位置统计数据
  locationStats: TLocationStatResponse | null;
  // 设备统计数据
  deviceStats: TDeviceStatResponse | null;
  // 消息趋势数据
  msgTrend: TMsgTrendResponse | null;
  // 系统状态
  systemStatus: TSystemStatusResponse | null;
  // 系统概要
  systemSummary: TSystemSummaryResponse | null;
  // 系统效率
  systemEfficiency: TSystemEfficiencyResponse | null;
  // 系统实时信息
  systemRealInfo: TSystemRealInfoResponse | null;
  // 刷新时间
  lastUpdateTime: number;
  // 是否正在加载
  isLoading: boolean;
}

/**
 * 仪表板状态管理
 */
export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    locationStats: null,
    deviceStats: null,
    msgTrend: null,
    systemStatus: null,
    systemSummary: null,
    systemEfficiency: null,
    systemRealInfo: null,
    lastUpdateTime: 0,
    isLoading: false,
  }),

  getters: {
    // 获取最后更新时间
    lastUpdateDate: (state) => {
      if (!state.lastUpdateTime) return null;
      return new Date(state.lastUpdateTime);
    },

    // 是否有数据
    hasData: (state) => {
      return !!(
        state.locationStats ||
        state.deviceStats ||
        state.msgTrend ||
        state.systemStatus ||
        state.systemSummary ||
        state.systemEfficiency ||
        state.systemRealInfo
      );
    },

    // 系统是否正常运行
    isSystemRunning: (state) => {
      return state.systemStatus?.status === 'running';
    },
  },

  actions: {
    // 设置位置统计数据
    setLocationStats(data: TLocationStatResponse) {
      this.locationStats = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置设备统计数据
    setDeviceStats(data: TDeviceStatResponse) {
      this.deviceStats = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置消息趋势数据
    setMsgTrend(data: TMsgTrendResponse) {
      this.msgTrend = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置系统状态
    setSystemStatus(data: TSystemStatusResponse) {
      this.systemStatus = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置系统概要
    setSystemSummary(data: TSystemSummaryResponse) {
      this.systemSummary = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置系统效率
    setSystemEfficiency(data: TSystemEfficiencyResponse) {
      this.systemEfficiency = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置系统实时信息
    setSystemRealInfo(data: TSystemRealInfoResponse) {
      this.systemRealInfo = data;
      this.lastUpdateTime = Date.now();
    },

    // 设置加载状态
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    // 清除所有数据
    clearAllData() {
      this.locationStats = null;
      this.deviceStats = null;
      this.msgTrend = null;
      this.systemStatus = null;
      this.systemSummary = null;
      this.systemEfficiency = null;
      this.systemRealInfo = null;
      this.lastUpdateTime = 0;
    },

    // 批量更新数据
    batchUpdate(data: Partial<DashboardState>) {
      Object.assign(this, data);
      this.lastUpdateTime = Date.now();
    },
  },

  persist: {
    key: 'pinia_dashboard',
    paths: ['lastUpdateTime'],
    expire: 86400000, // 24小时过期
  },
});