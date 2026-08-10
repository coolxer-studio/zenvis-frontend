<template>
  <div class="main-content rule-div">
    <header class="policy-page-heading">
      <div>
        <span class="policy-page-eyebrow">CONFIGURATION WORKSPACE</span>
        <h1>{{ pageTitle }}</h1>
        <p>集中浏览、校验并发布平台配置，编辑内容会在当前文件中保留。</p>
      </div>
      <div class="policy-current-file" :class="{ 'is-empty': !currentFileName }">
        <span class="policy-file-dot"></span>
        <div>
          <small>{{ currentFileName ? '正在编辑' : '当前状态' }}</small>
          <strong>{{ currentFileName || '尚未选择配置文件' }}</strong>
        </div>
      </div>
    </header>

    <el-splitter class="policy-splitter" :layout="isNarrow ? 'vertical' : 'horizontal'">
      <el-splitter-panel :size="isNarrow ? 34 : 24" :min="isNarrow ? 22 : 18">
        <LeftConfig
          :treeData="configList"
          @on-click="getTextContent"
          @on-add="handleAddNode"
          @on-edit="handleEditNode"
          @on-delete="handleDeleteNode"
        />
      </el-splitter-panel>
      <el-splitter-panel :size="isNarrow ? 66 : 76" :min="isNarrow ? 42 : 45">
        <RightEdit
          :schemaType="configType"
          :modelValue="fileContext"
          width="100%"
          height="100%"
          :fileName="currentFileName"
          @on-apply="apply"
          @on-click="saveText"
          :language="language"
          @editor-mounted="editorMounted"
        />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as monaco from 'monaco-editor';

import LeftConfig from './components/leftConfig.vue';
import RightEdit from './components/rightEdit.vue';

import { PolicyService } from '@/service/api';

// 类型定义
interface TreeNode {
  id: string;
  file_name: string;
  relative_path?: string;
  nodes?: TreeNode[];
  selectable?: boolean;
  [key: string]: any;
}

// 添加 JSON Schema 类型定义
interface JsonSchema {
  [key: string]: any;
}

// 响应式数据
const route = useRoute();
const configType = ref<string>(route.params['menuParams']?.toString() || '');
const configList = ref<TreeNode[]>([]);
const fileContext = ref<string>('');
const currentFileName = ref<string>('');
const language = ref<string>('javascript');
const isNarrow = ref(false);

const pageTitle = computed(() => {
  const names: Record<string, string> = {
    meta: '元数据配置',
    dashboard: '看板配置',
    menu: '菜单配置',
    datasource: '数据源配置',
  };
  return names[configType.value] || '配置管理';
});

const updateViewport = () => {
  isNarrow.value = window.innerWidth < 960;
};

const nodePath = (node: TreeNode) => node.relative_path || node.file_name;

const renamedNodePath = (node: TreeNode, newName: string) => {
  const originalPath = nodePath(node);
  const separatorIndex = originalPath.lastIndexOf('/');
  return separatorIndex === -1
    ? newName
    : `${originalPath.substring(0, separatorIndex + 1)}${newName}`;
};

const routeFileName = () => {
  const fileName = route.query.fileName || route.query.file_name;
  return Array.isArray(fileName) ? fileName[0] || '' : fileName?.toString() || '';
};

// 编辑器挂载回调
const editorMounted = (editor: monaco.editor.IStandaloneCodeEditor) => {};

// 获取文件内容
const getTextContent = (path: string) => {
  if (!path || !configType.value) return;
  fileContext.value = '';
  currentFileName.value = '';

  PolicyService.textContent(configType.value, { file_name: path }).then((res: string) => {
    fileContext.value = res;
    currentFileName.value = path;

    const dotIndex = currentFileName.value.lastIndexOf('.');
    if (dotIndex !== -1) {
      language.value = currentFileName.value.substring(dotIndex + 1);
    }
  });
};

// 保存文件内容
const apply = (json: string) => {
  PolicyService.applyJsonText(configType.value, {
    file_name: currentFileName.value,
    text: json,
  }).then(() => {
    ElMessage.success('应用成功');
  });
};
// 保存文件内容
const saveText = (json: string) => {
  PolicyService.saveJsonText(configType.value, {
    file_name: currentFileName.value,
    text: json,
  }).then(() => {
    ElMessage.success('保存成功');
  });
};

// 设置节点可选择性
const setSelectable = (data: TreeNode[]): TreeNode[] => {
  return data.map(node => {
    if (node.nodes && node.nodes.length) {
      node.selectable = false;
      node.nodes = setSelectable(node.nodes);
    }
    return node;
  });
};

// 获取配置列表
const getListConfig = () => {
  if (!configType.value) return;

  PolicyService.getConfig(configType.value).then((res: TreeNode[]) => {
    configList.value = setSelectable(res);
  });
};

// 处理添加节点事件
const handleAddNode = (nodeData: { parent: TreeNode; name: string }) => {
  const params = {
    parent_id: nodeData.parent.id,
    file_name: nodeData.name,
  };

  PolicyService.addNode(configType.value, params)
    .then(() => {
      ElMessage.success('添加成功');
      getListConfig(); // 重新加载树
    })
    .catch(() => {
      ElMessage.error('添加失败');
    });
};

// 处理编辑节点事件
const handleEditNode = (nodeData: { node: TreeNode; newName: string }) => {
  const params = {
    id: nodeData.node.id,
    original_file_name: nodePath(nodeData.node),
    file_name: renamedNodePath(nodeData.node, nodeData.newName),
  };

  PolicyService.renameNode(configType.value, params)
    .then(() => {
      ElMessage.success('更新成功');
      getListConfig(); // 重新加载树
    })
    .catch(() => {
      ElMessage.error('更新失败');
    });
};

// 处理删除节点事件
const handleDeleteNode = (nodeData: TreeNode) => {
  const params = {
    id: nodeData.id,
    file_name: nodePath(nodeData),
  };

  PolicyService.deleteNode(configType.value, params)
    .then(() => {
      ElMessage.success('删除成功');
      getListConfig(); // 重新加载树

      // 如果删除的是当前正在编辑的文件，则清空编辑器
      if (currentFileName.value === nodePath(nodeData)) {
        fileContext.value = '';
        currentFileName.value = '';
      }
    })
    .catch(() => {
      ElMessage.error('删除失败');
    });
};

// 初始化数据
getListConfig();
if (routeFileName()) {
  getTextContent(routeFileName());
}

// 监听路由变化
watch(
  () => [route.params['menuParams'], route.query.fileName, route.query.file_name],
  ([newParams]) => {
    const newConfigType = newParams?.toString() || '';
    if (newConfigType && newConfigType !== configType.value) {
      configType.value = newConfigType;
      getListConfig();
      fileContext.value = '';
      currentFileName.value = '';
    }
    const nextFileName = routeFileName();
    if (nextFileName && nextFileName !== currentFileName.value) {
      getTextContent(nextFileName);
    }
  },
  { deep: true },
);

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport);
});
</script>

<style lang="scss" scoped>
.rule-div {
  display: flex;
  width: auto;
  height: auto;
  min-height: 0;
  padding: 0;
  margin: 16px;
  overflow: hidden;
  flex: 1 1 auto;
  flex-direction: column;
  background: transparent !important;
  border: 0;
  border-radius: 0;
}

.policy-splitter {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--zv-bg-elevated);
  border: 1px solid var(--zv-border);
  border-radius: var(--zv-radius-lg);
  box-shadow: var(--zv-shadow-md);
}

.policy-splitter :deep(.el-splitter__pane) {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.policy-splitter :deep(.el-splitter-bar__dragger) {
  background: var(--zv-border);
  transition: background-color 160ms ease;
}

.policy-splitter :deep(.el-splitter-bar__dragger:hover) {
  background: var(--zv-primary);
}

.policy-page-heading {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 2px 2px 16px;
}

.policy-page-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--zv-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.policy-page-heading h1 {
  margin: 0;
  color: var(--zv-text);
  font-size: clamp(22px, 2vw, 30px);
  line-height: 1.2;
}

.policy-page-heading p {
  margin: 7px 0 0;
  color: var(--zv-text-secondary);
  font-size: 13px;
}

.policy-current-file {
  display: flex;
  min-width: min(380px, 36vw);
  max-width: 48vw;
  align-items: center;
  gap: 11px;
  padding: 10px 14px;
  background: var(--zv-bg-elevated);
  border: 1px solid var(--zv-border);
  border-radius: 12px;
  box-shadow: var(--zv-shadow-sm);
}

.policy-current-file.is-empty {
  opacity: 0.76;
}

.policy-current-file small,
.policy-current-file strong {
  display: block;
}

.policy-current-file small {
  margin-bottom: 2px;
  color: var(--zv-text-muted);
  font-size: 11px;
}

.policy-current-file strong {
  overflow: hidden;
  color: var(--zv-text);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.policy-file-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  background: var(--zv-success);
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(18, 185, 129, 0.12);
}

.is-empty .policy-file-dot {
  background: var(--zv-text-muted);
  box-shadow: 0 0 0 5px rgba(139, 151, 170, 0.12);
}

@media (max-width: 959px) {
  .rule-div {
    height: auto;
    margin: 10px;
  }

  .policy-page-heading {
    align-items: flex-start;
    padding-bottom: 10px;
  }

  .policy-page-heading p,
  .policy-current-file small {
    display: none;
  }

  .policy-current-file {
    min-width: 0;
    max-width: 46vw;
    padding: 8px 11px;
  }
}

@media (max-width: 640px) {
  .policy-page-eyebrow,
  .policy-current-file {
    display: none;
  }
}
</style>
