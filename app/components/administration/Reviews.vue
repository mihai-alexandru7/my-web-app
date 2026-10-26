<script setup lang="ts">

import { formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

interface ReviewRow {
  id: number
  rating: number | null
  comment: string | null
  createdAt: string
  userId: number
  userFirstName: string
  userLastName: string
  bookId: number
  bookTitle: string
}

const page = ref(1)
const pageSize = 15

const bookIdInput = ref<number | ''>('')
const userIdInput = ref<number | ''>('')
const bookId = ref<number | undefined>()
const userId = ref<number | undefined>()

const query = computed(() => ({
  bookId: bookId.value,
  userId: userId.value,
  page: page.value,
  pageSize,
}))

const { data, refresh, pending } = useFetch<{ items: ReviewRow[]; total: number }>('/api/administration/reviews', { query })
const reviews = computed(() => data.value?.items ?? [])

const columns: TableColumn[] = [
  { key: 'book', label: 'Book' },
  { key: 'reader', label: 'Reader' },
  { key: 'rating', label: 'Rating' },
  { key: 'comment', label: 'Comment' },
  { key: 'createdAt', label: 'Date' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' }
]

const error = ref('')
const busy = ref(false)

function toId(value: number | ''): number | undefined {
  return value === '' || Number.isNaN(Number(value)) ? undefined : Number(value)
}

function applyFilters() {
  bookId.value = toId(bookIdInput.value)
  userId.value = toId(userIdInput.value)
  page.value = 1
}

function clearFilters() {
  bookIdInput.value = ''
  userIdInput.value = ''
  applyFilters()
}

async function remove(review: ReviewRow) {
  if (!confirm(`Delete this review of "${review.bookTitle}" by ${review.userFirstName} ${review.userLastName}?`)) return

  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/administration/reviews/${review.id}`, { method: 'DELETE' })
    if (reviews.value.length === 1 && page.value > 1) {
      page.value--
    } else {
      await refresh()
    }
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <div>
    <form class="action-form-bar" @submit.prevent="applyFilters">
      <input
          v-model.number="bookIdInput"
          class="numeric-filter-input"
          type="number"
          min="1"
          placeholder="Book ID"
          aria-label="Filter by book ID"
      />
      <input
          v-model.number="userIdInput"
          class="numeric-filter-input"
          type="number"
          min="1"
          placeholder="User ID"
          aria-label="Filter by user ID"
      />
      <Button type="submit">Filter</Button>
      <Button variant="outline" type="button" @click="clearFilters">Clear</Button>
    </form>

    <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="reviews"
        row-key="id"
        :pending="pending"
        loading-message="Loading reviews..."
        empty-message="No reviews found."
    >
      <template #cell-book="{ row }">
        {{ row.bookTitle }} <span class="muted-identifier-text">#{{ row.bookId }}</span>
      </template>

      <template #cell-reader="{ row }">
        {{ row.userFirstName }} {{ row.userLastName }} <span class="muted-identifier-text">#{{ row.userId }}</span>
      </template>

      <template #cell-rating="{ row }">
        {{ row.rating ? `${row.rating} / 5` : '—' }}
      </template>

      <template #cell-comment="{ row }">
        <span class="review-comment-display">{{ row.comment || '—' }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="table-actions-container">
          <Button size="small" variant="danger" :disabled="busy" @click="remove(row)">
            Delete
          </Button>
        </div>
      </template>
    </DataTable>

    <Pager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />
  </div>
</template>

<style scoped>

.action-form-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-medium);
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--box-shadow-card);
}

.numeric-filter-input {
  width: 110px;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.98rem;
}

.notification-error-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1.5px solid var(--color-status-danger);
  background: var(--color-status-danger-background);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-weight: 500;
}

.muted-identifier-text {
  color: var(--color-text-muted);
}

.review-comment-display {
  max-width: 380px;
  display: inline-block;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.table-actions-container {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

</style>