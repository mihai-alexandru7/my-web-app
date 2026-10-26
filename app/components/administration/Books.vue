<script setup lang="ts">

import { formatPrice, formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

type BookStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

interface BookRow {
  id: number
  title: string
  price: string
  status: BookStatus
  createdAt: string
  publisherName: string
}

interface NamedItem {
  id: number
  name: string
}

interface BookDetail {
  id: number
  title: string
  description: string | null
  price: string
  isbn: string | null
  publishedYear: number | null
  status: BookStatus
  rejectionReason: string | null
  reviewedAt: string | null
  createdAt: string
  publisherName: string
  language: { code: string; name: string }
  authors: NamedItem[]
  genres: NamedItem[]
  categories: NamedItem[]
}

const statuses: { id: string; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' }
]

const status = ref<string>('pending')
const page = ref(1)
const pageSize = 15
const query = computed(() => ({ status: status.value, page: page.value, pageSize }))

const { data, refresh, pending } = useFetch<{ items: BookRow[]; total: number }>('/api/administration/books', { query })
const books = computed(() => data.value?.items ?? [])

const columns: TableColumn[] = [
  { key: 'title', label: 'Title' },
  { key: 'publisherName', label: 'Publisher' },
  { key: 'price', label: 'Price' },
  { key: 'createdAt', label: 'Submitted' },
  { key: 'actions', label: 'Actions', align: 'right', width: '180px' }
]

watch(status, () => {
  page.value = 1
})

const error = ref('')
const busy = ref(false)
const detail = ref<BookDetail | null>(null)
const rejecting = ref<{ id: number; title: string } | null>(null)
const reason = ref('')

async function run(action: () => Promise<unknown>): Promise<boolean> {
  error.value = ''
  busy.value = true
  try {
    await action()
    await refresh()
    return true
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
    return false
  } finally {
    busy.value = false
  }
}

async function openDetail(id: number) {
  error.value = ''
  try {
    const response = await $fetch<{ book: BookDetail }>(`/api/administration/books/${id}`)
    detail.value = response.book
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  }
}

async function approve(id: number) {
  if (await run(() => $fetch(`/api/administration/books/${id}/approve`, { method: 'POST' }))) {
    detail.value = null
  }
}

function startReject(id: number, title: string) {
  error.value = ''
  reason.value = ''
  rejecting.value = { id, title }
}

async function confirmReject() {
  if (!rejecting.value) return
  const { id } = rejecting.value
  const success = await run(() =>
      $fetch(`/api/administration/books/${id}/reject`, { method: 'POST', body: { reason: reason.value } }),
  )
  if (success) {
    rejecting.value = null
    detail.value = null
  }
}

async function withdraw(id: number, title: string) {
  if (!confirm(`Withdraw "${title}" from sale? It will be removed from carts.`)) return
  if (await run(() => $fetch(`/api/administration/books/${id}/withdraw`, { method: 'POST' }))) {
    detail.value = null
  }
}

</script>

<template>
  <section>
    <TabGroup v-model="status" :options="statuses" />

    <p v-if="error && !detail && !rejecting" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="books"
        row-key="id"
        :pending="pending"
        loading-message="Loading books..."
        empty-message="No books with this status."
    >
      <template #cell-price="{ row }">{{ formatPrice(row.price) }}</template>
      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
      <template #cell-actions="{ row }">
        <div class="table-actions-container">
          <Button variant="outline" size="small" @click="openDetail(row.id)">View</Button>
          <template v-if="row.status === 'pending'">
            <Button size="small" :disabled="busy" @click="approve(row.id)">Approve</Button>
            <Button variant="danger" size="small" :disabled="busy" @click="startReject(row.id, row.title)">
              Reject
            </Button>
          </template>
          <Button
              v-else-if="row.status === 'approved'"
              variant="danger"
              size="small"
              :disabled="busy"
              @click="withdraw(row.id, row.title)"
          >
            Withdraw
          </Button>
        </div>
      </template>
    </DataTable>

    <Pager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />

    <Modal v-if="detail" :title="detail.title" @close="detail = null">
      <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>
      <DescriptionList>
        <dt>Status</dt>
        <dd><StatusBadge :status="detail.status" /></dd>
        <dt>Publisher</dt>
        <dd>{{ detail.publisherName }}</dd>
        <dt>Authors</dt>
        <dd>{{ detail.authors.map((author) => author.name).join(', ') || '—' }}</dd>
        <dt>Language</dt>
        <dd>{{ detail.language.name }} ({{ detail.language.code }})</dd>
        <dt>Genres</dt>
        <dd>{{ detail.genres.map((genre) => genre.name).join(', ') || '—' }}</dd>
        <dt>Categories</dt>
        <dd>{{ detail.categories.map((category) => category.name).join(', ') || '—' }}</dd>
        <dt>Price</dt>
        <dd>{{ formatPrice(detail.price) }}</dd>
        <dt>ISBN</dt>
        <dd>{{ detail.isbn || '—' }}</dd>
        <dt>Published</dt>
        <dd>{{ detail.publishedYear ?? '—' }}</dd>
        <dt>Submitted</dt>
        <dd>{{ formatDate(detail.createdAt) }}</dd>
        <template v-if="detail.reviewedAt">
          <dt>Reviewed</dt>
          <dd>{{ formatDate(detail.reviewedAt) }}</dd>
        </template>
        <template v-if="detail.rejectionReason">
          <dt>Rejection reason</dt>
          <dd class="multiline-content">{{ detail.rejectionReason }}</dd>
        </template>
        <dt>Description</dt>
        <dd class="multiline-content">{{ detail.description || '—' }}</dd>
      </DescriptionList>

      <template #footer>
        <template v-if="detail.status === 'pending'">
          <Button variant="danger" :disabled="busy" @click="startReject(detail.id, detail.title)">
            Reject
          </Button>
          <Button :disabled="busy" @click="approve(detail.id)">Approve</Button>
        </template>
        <Button
            v-else-if="detail.status === 'approved'"
            variant="danger"
            :disabled="busy"
            @click="withdraw(detail.id, detail.title)"
        >
          Withdraw from sale
        </Button>
        <Button variant="outline" @click="detail = null">Close</Button>
      </template>
    </Modal>

    <Modal v-if="rejecting" :title="`Reject ${rejecting.title}`" danger @close="rejecting = null">
      <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>
      <label for="reject-reason" class="modal-input-label">The publisher will see this reason.</label>
      <textarea
          id="reject-reason"
          v-model="reason"
          class="rejection-reason-textarea"
          maxlength="500"
          placeholder="Why is this book being rejected?"
      />
      <template #footer>
        <Button variant="outline" @click="rejecting = null">Cancel</Button>
        <Button variant="danger" :disabled="busy || !reason.trim()" @click="confirmReject">
          Reject book
        </Button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>

.notification-error-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1.5px solid var(--color-status-danger);
  background: var(--color-status-danger-background);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-weight: 500;
}

.table-actions-container {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal-input-label {
  color: var(--color-text-muted);
}

.rejection-reason-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 100px;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.98rem;
  resize: vertical;
}

</style>