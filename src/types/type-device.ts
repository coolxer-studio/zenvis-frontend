export type TDeviceListResponse = {
  device_id: string;
  host_ip: string;
  host_mac: string;
  hostname: string;
  id: string;
  message_id: string;
  parent_id: string;
  type: string;
  data: string;
};

// 消息标签参数
export type TGetMsgTagParams = {
  entity_name: string;
  start_time?: string;
  end_time?: string;
};

// 消息标签项
export type TMsgTagItem = {
  tag: string;
  count: number;
  percentage?: number;
};

// 消息标签响应
export type TMsgTagResponse = {
  tags: TMsgTagItem[];
  total: number;
};

// 消息趋势参数
export type TGetMsgTrendParams = {
  entity_name: string;
  start_time: string;
  end_time: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
};

// 消息趋势数据点
export type TMsgTrendDataPoint = {
  time: string;
  count: number;
};

// 消息趋势响应
export type TMsgTrendResponse = {
  trend: TMsgTrendDataPoint[];
  entity_name: string;
};

// 消息列表参数
export type TGetMsgListParams = {
  entity_name: string;
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown;
};

// 消息列表项
export type TMsgListItem = {
  id: string;
  [key: string]: unknown;
};

// 消息列表响应
export type TMsgListResponse = {
  rows: TMsgListItem[];
  total: number;
  page: number;
  size: number;
};

// 条目列表参数
export type TGetEntryListParams = {
  entity_name: string;
  page?: number;
  size?: number;
  [key: string]: unknown;
};

// 条目列表项
export type TEntryListItem = {
  id: string;
  name?: string;
  [key: string]: unknown;
};

// 条目列表响应
export type TEntryListResponse = {
  rows: TEntryListItem[];
  total: number;
};