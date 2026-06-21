<template>
  <el-table
    :data="state.data"
    :scrollbar-always-on="true"
    border
    style="width: 100%"
    v-loading="state.loading"
    @sort-change="change"
  >
    <el-table-column
      v-for="column in state.sourceColumns"
      :key="column.dataIndex"
      :prop="column.dataIndex"
      :label="column.title"
      :width="column.width"
      :min-width="column.minWidth"
      :fixed="column.fixed"
      :sortable="column.sortable"
      :show-overflow-tooltip="column.ellipsis"
    >
      <template #default="{ row, column: col }">
        <template v-if="col.property === 'data'">
          <el-tooltip content="数据查看" placement="top">
            <img class="json-svg" src="/src/assets/svg-icon/json.svg" @click="showData(row.data)" alt="">
          </el-tooltip>
        </template>
        <template v-else>
          {{ row[col.property] }}
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
  defineProps({
    state: Object,
    scroll: Number,
  });
  const emit = defineEmits({
    'on-change': null,
    'on-click': null,
    'on-resize': null,
  });
  const change = (pagination: any): void => {
    emit('on-change', { pagination });
  };
  const showData = (val) => {
    emit('on-click', val);
  }
</script>

<style lang="scss" scoped>

</style>
