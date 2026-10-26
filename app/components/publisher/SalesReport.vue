<script setup lang="ts">

import { formatPrice } from '@/utils/formatters'
import type { TableColumn } from '@/types/publisher'

const { from, to, report, pending } = usePublisherSalesReport()

const columns: TableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'unitsSold', label: 'Units sold' },
  { key: 'currentPrice', label: 'Current store price' },
  { key: 'revenue', label: 'Total revenue' },
]

</script>

<template>
  <div>
    <DateRangeFilter v-model:from="from" v-model:to="to" />

    <div class="statistics-grid">
      <StatCard label="Total revenue" :value="formatPrice(report?.summary.revenue || '0.00')" />
      <StatCard label="Units sold" :value="report?.summary.unitsSold || 0" />
      <StatCard label="Completed orders" :value="report?.summary.orders || 0" />
    </div>

    <h3 class="breakdown-headline">Sales Breakdown by Book</h3>
    <DataTable
        :columns="columns"
        :rows="report?.books ?? []"
        row-key="bookId"
        :pending="pending"
        :show-more-pagination="true"
        :reset-key="`${from}|${to}`"
        loading-message="Loading report data..."
        empty-message="No sales registered for this selection."
    >
      <template #cell-title="{ row }"><strong>{{ row.title }}</strong></template>
      <template #cell-currentPrice="{ row }">{{ formatPrice(row.currentPrice) }}</template>
      <template #cell-revenue="{ row }"><strong>{{ formatPrice(row.revenue) }}</strong></template>
    </DataTable>
  </div>
</template>

<style scoped>

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.breakdown-headline {
  margin: 28px 0 12px;
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--color-action-primary);
}

</style>