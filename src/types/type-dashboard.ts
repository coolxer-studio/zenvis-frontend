export type TSpeedStatResponse = {
  receive_time_average: number;
  receive_time_current: number;
  process_time_average: number;
  process_time_current: number;
  count_of_second_average: number;
  count_of_second_current: number;
}

export type TGetLocationStat = {
  start_time: string;
  end_time:string;
}
export type TGetDeviceStat = {
  start_time: string;
  end_time:string;
}
export type TGetMsgTrend = {
  start_time: string;
  end_time:string;
}
export type TLocationStatResponse = {
  xaxis: string[];
  yaxis_name: string[];
  yaxis_data: number[][];
}
export type TDeviceStatResponse = {
  xaxis: string[];
  yaxis_name: string[];
  yaxis_data: number[][];
}
export type TMsgTrendResponse = {
  xaxis: string[];
  yaxis_name: string[];
  yaxis_data: number[][];
}

// 系统状态响应
export type TSystemStatusResponse = {
  status: 'running' | 'stopped' | 'error';
  uptime?: number;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
};

// 系统概要参数
export type TGetSystemSummary = {
  start_time?: string;
  end_time?: string;
};

// 系统概要响应
export type TSystemSummaryResponse = {
  total_messages: number;
  success_messages: number;
  failed_messages: number;
  avg_process_time: number;
  peak_time?: string;
  daily_stats?: {
    date: string;
    count: number;
  }[];
};

// 系统效率响应
export type TSystemEfficiencyResponse = {
  efficiency: number;
  throughput: number;
  latency: number;
  availability: number;
};

// 系统实时信息响应
export type TSystemRealInfoResponse = {
  timestamp: string;
  active_connections: number;
  queue_size: number;
  processing_rate: number;
  error_rate: number;
};