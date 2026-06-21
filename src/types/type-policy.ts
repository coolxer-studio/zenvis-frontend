// 策略配置相关类型定义

// 配置类型枚举
export type ConfigType = string;

// 配置树节点
export type ConfigTreeNode = {
  id: string;
  name: string;
  label: string;
  type?: string;
  children?: ConfigTreeNode[];
  [key: string]: unknown;
};

// Schema 参数
export type SchemaParams = {
  path?: string;
  name?: string;
};

// Schema 响应
export type SchemaResponse = {
  type: string;
  title?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};

// 文本内容参数
export type TextContentParams = {
  path: string;
  name?: string;
};

// 文本内容响应
export type TextContentResponse = {
  content: string;
  format?: string;
  [key: string]: unknown;
};

// 保存 JSON 文本参数
export type SaveJsonTextParams = {
  path: string;
  content: string;
  name?: string;
};

// 保存响应
export type SaveResponse = {
  success: boolean;
  message?: string;
  path?: string;
};

// 应用响应
export type ApplyResponse = {
  success: boolean;
  message?: string;
};

// 添加节点参数
export type AddNodeParams = {
  parentPath?: string;
  name: string;
  type?: string;
  [key: string]: unknown;
};

// 添加节点响应
export type AddNodeResponse = {
  success: boolean;
  message?: string;
  node?: ConfigTreeNode;
};

// 删除节点参数
export type DeleteNodeParams = {
  path: string;
  name?: string;
};

// 删除节点响应
export type DeleteNodeResponse = {
  success: boolean;
  message?: string;
};

// 重命名节点参数
export type RenameNodeParams = {
  path: string;
  oldName: string;
  newName: string;
};

// 重命名节点响应
export type RenameNodeResponse = {
  success: boolean;
  message?: string;
};
