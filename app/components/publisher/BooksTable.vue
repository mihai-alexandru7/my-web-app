<script setup lang="ts">

import { formatPrice, formatDate } from '@/utils/formatters'
import type { PublisherBookRow, TableColumn } from '@/types/publisher'

defineProps<{
  books: PublisherBookRow[]
  pending: boolean
}>()

const emit = defineEmits<{
  edit: [bookId: number]
  withdraw: [bookId: number, title: string]
}>()

const columns: TableColumn[] = [
  { key: 'cover', label: 'Cover', width: '70px' },
  { key: 'title', label: 'Title' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Submitted' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

</script>

<template>
  <DataTable
      :columns="columns"
      :rows="books"
      row-key="id"
      :pending="pending"
      :show-more-pagination="true"
      loading-message="Loading books..."
      empty-message='No books uploaded yet. Click "Upload Book" to add your first title.'
  >
    <template #cell-cover="{ row }">
      <CoverThumbnail :book-id="row.id" :title="row.title" :has-cover="Boolean(row.coverPath)" />
    </template>

    <template #cell-title="{ row }">
      <strong>{{ row.title }}</strong>
      <p v-if="row.status === 'rejected' && row.rejectionReason" class="rejection-reason-text">
        Reason: {{ row.rejectionReason }}
      </p>
    </template>

    <template #cell-price="{ row }">{{ formatPrice(row.price) }}</template>

    <template #cell-status="{ row }">
      <StatusBadge :status="row.status" />
    </template>

    <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>

    <template #cell-actions="{ row }">
      <div class="row-actions-container">
        <Button v-if="row.status !== 'withdrawn'" variant="outline" size="small" @click="emit('edit', row.id)">
          Edit
        </Button>
        <Button
            v-if="row.status === 'pending' || row.status === 'approved'"
            variant="danger"
            size="small"
            @click="emit('withdraw', row.id, row.title)"
        >
          Withdraw
        </Button>
      </div>
    </template>
  </DataTable>
</template>

<style scoped>

.rejection-reason-text {
  margin: 4px 0 0;
  font-size: 0.88rem;
  color: var(--color-status-danger);
}

.row-actions-container {
  display: inline-flex;
  gap: 8px;
}

</style>