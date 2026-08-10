<template>
  <div class="tree-container">
    <header class="tree-header">
      <div>
        <strong>配置文件</strong>
        <span>{{ fileCount }} 个文件</span>
      </div>
      <el-input v-model="filterText" :prefix-icon="Search" clearable placeholder="搜索文件名" />
    </header>

    <div class="tree-scroll">
      <el-tree
        v-if="treeData.length"
        ref="treeRef"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        default-expand-all
        highlight-current
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="tree-node-title" :title="node.label">{{ node.label }}</span>
            <span class="tree-node-actions">
              <!-- 一级节点只显示添加按钮 -->
              <template v-if="node.level === 1">
                <el-icon title="添加配置" @click.stop="addNode(data)"><Plus /></el-icon>
              </template>
              <!-- 所有非根节点都支持编辑和删除 -->
              <template v-else>
                <el-icon title="重命名" @click.stop="editNode(data)"><Edit /></el-icon>
                <el-icon title="删除" @click.stop="deleteNode(data)"><Delete /></el-icon>
              </template>
            </span>
          </div>
        </template>
      </el-tree>
      <el-empty v-else description="暂无配置文件" :image-size="72" />
    </div>

    <!-- 添加节点对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加节点" width="400px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="节点名称" prop="file_name">
          <el-input
            v-model="addForm.file_name"
            placeholder="请输入节点名称"
            @keyup.enter="confirmAdd"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAdd" :loading="addLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑节点对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑节点" width="400px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="节点名称" prop="file_name">
          <el-input
            v-model="editForm.file_name"
            placeholder="请输入节点名称"
            @keyup.enter="confirmEdit"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit" :loading="editLoading"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import {
  ElMessageBox,
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
} from 'element-plus';
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue';
import { PropType } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

// 定义树节点类型
interface TreeNode {
  id: string;
  file_name: string;
  relative_path?: string;
  nodes?: TreeNode[];
  selectable?: boolean;
  [key: string]: any;
}

// 定义组件属性
const props = defineProps({
  treeData: {
    type: Array as PropType<TreeNode[]>,
    default: () => [],
  },
});

const treeRef = ref();
const filterText = ref('');

const countFiles = (nodes: TreeNode[]): number =>
  nodes.reduce((total, node) => {
    if (node.nodes?.length) return total + countFiles(node.nodes);
    return total + 1;
  }, 0);

const fileCount = computed(() => countFiles(props.treeData));

const filterNode = (value: string, data: TreeNode) => {
  if (!value) return true;
  return data.file_name.toLowerCase().includes(value.trim().toLowerCase());
};

watch(filterText, value => treeRef.value?.filter(value));

// 定义事件发射
const emit = defineEmits<{
  (e: 'on-click', fileName: string): void;
  (e: 'on-add', nodeData: { parent: TreeNode; name: string }): void;
  (e: 'on-edit', nodeData: { node: TreeNode; newName: string }): void;
  (e: 'on-delete', nodeData: TreeNode): void;
}>();

// 添加节点对话框相关
const addDialogVisible = ref(false);
const addFormRef = ref<FormInstance>();
const addLoading = ref(false);
const currentParentNode = ref<TreeNode | null>(null);

const addForm = reactive({
  file_name: '',
});

const addRules = reactive<FormRules>({
  file_name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
});

// 编辑节点对话框相关
const editDialogVisible = ref(false);
const editFormRef = ref<FormInstance>();
const editLoading = ref(false);
const currentEditNode = ref<TreeNode | null>(null);

const editForm = reactive({
  file_name: '',
});

const editRules = reactive<FormRules>({
  file_name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
});

// 树组件属性配置
const defaultProps = {
  children: 'nodes',
  label: 'file_name',
};

// 节点点击事件处理
const handleNodeClick = (data: TreeNode) => {
  if (data && !(data.nodes && data.nodes.length)) {
    emit('on-click', data.relative_path || data.file_name);
  }
};

// 添加节点事件处理
const addNode = (nodeData: TreeNode) => {
  currentParentNode.value = nodeData;
  addForm.file_name = '';
  addDialogVisible.value = true;

  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    addFormRef.value?.clearValidate();
  });
};

// 编辑节点事件处理
const editNode = (nodeData: TreeNode) => {
  currentEditNode.value = nodeData;
  editForm.file_name = nodeData.file_name;
  editDialogVisible.value = true;

  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    editFormRef.value?.clearValidate();
  });
};

// 删除节点事件处理
const deleteNode = (nodeData: TreeNode) => {
  ElMessageBox.confirm(`确定要删除"${nodeData.file_name}"吗？`, '确认删除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('on-delete', nodeData);
    })
    .catch(() => {
      // 用户取消删除
      ElMessage({
        type: 'info',
        message: '已取消删除',
      });
    });
};

// 确认添加节点
const confirmAdd = async () => {
  if (!addFormRef.value) return;

  await addFormRef.value.validate(valid => {
    if (valid) {
      addLoading.value = true;

      try {
        emit('on-add', {
          parent: currentParentNode.value!,
          name: addForm.file_name,
        });

        // 关闭对话框
        addDialogVisible.value = false;
        ElMessage.success('添加成功');
      } catch (error) {
        ElMessage.error('添加失败');
      } finally {
        addLoading.value = false;
      }
    }
  });
};

// 确认编辑节点
const confirmEdit = async () => {
  if (!editFormRef.value) return;

  await editFormRef.value.validate(valid => {
    if (valid) {
      editLoading.value = true;

      try {
        emit('on-edit', {
          node: currentEditNode.value!,
          newName: editForm.file_name,
        });

        // 关闭对话框
        editDialogVisible.value = false;
        ElMessage.success('编辑成功');
      } catch (error) {
        ElMessage.error('编辑失败');
      } finally {
        editLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.tree-container {
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  flex-direction: column;
  background: var(--zv-bg-elevated);
  border-right: 1px solid var(--zv-divider);
}

.tree-header {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(180deg, var(--zv-bg-subtle), var(--zv-bg-elevated));
  border-bottom: 1px solid var(--zv-divider);
}

.tree-header > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.tree-header strong {
  color: var(--zv-text);
  font-size: 14px;
}

.tree-header span {
  color: var(--zv-text-muted);
  font-size: 12px;
}

.tree-scroll {
  flex: 1;
  min-height: 0;
  padding: 10px 8px 18px;
  overflow: auto;
}

:deep(.el-tree) {
  min-width: 100%;
  background-color: transparent;
  color: var(--zv-text-secondary);
}

:deep(.el-tree-node) {
  white-space: nowrap;
}

:deep(.el-tree-node__content) {
  height: 36px;
  margin: 2px 0;
  border-radius: 8px;
  transition: color 150ms ease, background-color 150ms ease;
}

:deep(.el-tree-node__content:hover) {
  color: var(--zv-text);
  background: var(--zv-primary-soft);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--zv-primary);
  background: var(--zv-primary-soft);
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: 100%;
}

.tree-node-title {
  overflow: hidden;
  margin-right: 8px;
  text-overflow: ellipsis;
}

.tree-node-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.el-tree-node:hover) .tree-node-actions {
  opacity: 1;
}

.tree-node-actions .el-icon {
  width: 26px;
  height: 26px;
  margin-right: 2px;
  cursor: pointer;
  color: var(--zv-text-muted);
  border-radius: 7px;
}

.tree-node-actions .el-icon:hover {
  color: #409eff;
  background: rgba(79, 110, 247, 0.12);
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 959px) {
  .tree-container {
    border-right: 0;
    border-bottom: 1px solid var(--zv-divider);
  }

  .tree-header {
    display: grid;
    grid-template-columns: auto minmax(180px, 1fr);
    align-items: center;
    padding: 10px 12px;
  }
}
</style>
