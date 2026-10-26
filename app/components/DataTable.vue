<script setup lang="ts" generic="T extends Record<string, any>">

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right'
  width?: string
}

const props = withDefaults(
    defineProps<{
      columns: TableColumn[]
      rows: T[]
      rowKey: string
      pending?: boolean
      pageSize?: number
      showMorePagination?: boolean
      loadingMessage?: string
      emptyMessage?: string
      resetKey?: string | number
    }>(),
    {
      pending: false,
      pageSize: 5,
      showMorePagination: false,
      loadingMessage: 'Loading...',
      emptyMessage: 'Nothing to show.',
      resetKey: undefined,
    }
)

const visibleCount = ref(props.pageSize)
const visibleRows = computed(() => {
  if (!props.showMorePagination) {
    return props.rows
  }
  return props.rows.slice(0, visibleCount.value)
})

function showMore() {
  visibleCount.value += props.pageSize
}

function showLess() {
  visibleCount.value = props.pageSize
}

watch(() => props.resetKey, showLess)

</script>

<template>
  <div class="data-table-container">
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
        <tr>
          <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'align-right': column.align === 'right' }"
              :style="column.width ? { width: column.width } : undefined"
          >
            {{ column.label }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in visibleRows" :key="row[rowKey]">
          <td
              v-for="column in columns"
              :key="column.key"
              :class="{ 'align-right': column.align === 'right' }"
          >
            <slot :name="`cell-${column.key}`" :row="row">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="data-table-empty">
        {{ pending ? loadingMessage : emptyMessage }}
      </div>
    </div>

    <div v-if="showMorePagination && rows.length > pageSize" class="data-table-pagination-footer">
      <span class="pagination-information">Showing {{ visibleRows.length }} of {{ rows.length }}</span>
      <div class="pagination-button-group">
        <Button v-if="visibleRows.length < rows.length" variant="outline" size="small" @click="showMore">
          Show more
        </Button>
        <Button v-if="visibleRows.length > pageSize" variant="outline" size="small" @click="showLess">
          Show less
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.data-table-container {
  width: 100%;
}

.data-table-wrapper {
  overflow-x: auto;
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-medium);
  background: var(--color-background-field);
  box-shadow: var(--box-shadow-card);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--color-border-subtle);
}

.data-table th {
  background: var(--color-background-surface-alternate);
  color: var(--color-action-primary);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid var(--color-border-main);
  white-space: nowrap;
}

.data-table tbody tr:nth-child(even) {
  background: var(--color-row-alternate);
}

.data-table tbody tr:hover td {
  background: var(--color-row-hover);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table .align-right {
  text-align: right;
}

.data-table-empty {
  padding: 32px;
  text-align: center;
  color: var(--color-text-muted);
}

.data-table-pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}

.pagination-information {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.pagination-button-group {
  display: flex;
  gap: 8px;
}

</style>