<script setup lang="ts">

import { formatPrice, formatDate } from '@/utils/formatters'

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

const statuses: { id: BookStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' }
]

const status = ref<BookStatus>('pending')
const page = ref(1)
const pageSize = 15
const query = computed(() => ({ status: status.value, page: page.value, pageSize }))

const { data, refresh, pending } = useFetch<{ items: BookRow[]; total: number }>('/api/administration/books', { query })
const books = computed(() => data.value?.items ?? [])

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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  const ok = await run(() =>
      $fetch(`/api/administration/books/${id}/reject`, { method: 'POST', body: { reason: reason.value } }),
  )
  if (ok) {
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
    <div class="administration-tabs" role="tablist" aria-label="Filter by status">
      <button
          v-for="s in statuses"
          :key="s.id"
          class="administration-tab"
          :class="{ 'is-active': status === s.id }"
          type="button"
          role="tab"
          :aria-selected="status === s.id"
          @click="status = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <p v-if="error && !detail && !rejecting" class="administration-notice-error" role="alert">{{ error }}</p>

    <div class="administration-table-wrapper">
      <table class="administration-table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Publisher</th>
          <th>Price</th>
          <th>Submitted</th>
          <th style="width: 180px; text-align: right;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="book in books" :key="book.id">
          <td>{{ book.title }}</td>
          <td>{{ book.publisherName }}</td>
          <td>{{ formatPrice(book.price) }}</td>
          <td>{{ formatDate(book.createdAt) }}</td>
          <td class="administration-actions" style="justify-content: flex-end;">
            <button class="administration-button administration-button-small" type="button" @click="openDetail(book.id)">View</button>
            <template v-if="book.status === 'pending'">
              <button class="administration-button administration-button-small administration-button-primary" type="button" :disabled="busy" @click="approve(book.id)">
                Approve
              </button>
              <button
                  class="administration-button administration-button-small administration-button-danger"
                  type="button"
                  :disabled="busy"
                  @click="startReject(book.id, book.title)"
              >
                Reject
              </button>
            </template>
            <button
                v-else-if="book.status === 'approved'"
                class="administration-button administration-button-small administration-button-danger"
                type="button"
                :disabled="busy"
                @click="withdraw(book.id, book.title)"
            >
              Withdraw
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <p v-if="!books.length" class="administration-empty">{{ pending ? 'Loading…' : 'No books with this status.' }}</p>
    </div>

    <AdministrationPager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />

    <AdministrationModal v-if="detail" :title="detail.title" @close="detail = null">
      <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>
      <dl class="administration-description-list">
        <dt>Status</dt>
        <dd><span class="administration-badge" :class="`administration-badge-${detail.status}`">{{ detail.status }}</span></dd>
        <dt>Publisher</dt>
        <dd>{{ detail.publisherName }}</dd>
        <dt>Authors</dt>
        <dd>{{ detail.authors.map((a) => a.name).join(', ') || '—' }}</dd>
        <dt>Language</dt>
        <dd>{{ detail.language.name }} ({{ detail.language.code }})</dd>
        <dt>Genres</dt>
        <dd>{{ detail.genres.map((g) => g.name).join(', ') || '—' }}</dd>
        <dt>Categories</dt>
        <dd>{{ detail.categories.map((c) => c.name).join(', ') || '—' }}</dd>
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
          <dd class="administration-prewrap">{{ detail.rejectionReason }}</dd>
        </template>
        <dt>Description</dt>
        <dd class="administration-prewrap">{{ detail.description || '—' }}</dd>
      </dl>

      <template #footer>
        <template v-if="detail.status === 'pending'">
          <button class="administration-button administration-button-danger" type="button" :disabled="busy" @click="startReject(detail.id, detail.title)">
            Reject
          </button>
          <button class="administration-button administration-button-primary" type="button" :disabled="busy" @click="approve(detail.id)">Approve</button>
        </template>
        <button
            v-else-if="detail.status === 'approved'"
            class="administration-button administration-button-danger"
            type="button"
            :disabled="busy"
            @click="withdraw(detail.id, detail.title)"
        >
          Withdraw from sale
        </button>
        <button class="administration-button" type="button" @click="detail = null">Close</button>
      </template>
    </AdministrationModal>

    <AdministrationModal v-if="rejecting" :title="`Reject ${rejecting.title}`" @close="rejecting = null">
      <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>
      <label for="reject-reason" class="administration-muted">The publisher will see this reason.</label>
      <textarea
          id="reject-reason"
          v-model="reason"
          class="administration-textarea"
          maxlength="500"
          placeholder="Why is this book being rejected?"
      />
      <template #footer>
        <button class="administration-button" type="button" @click="rejecting = null">Cancel</button>
        <button class="administration-button administration-button-danger" type="button" :disabled="busy || !reason.trim()" @click="confirmReject">
          Reject book
        </button>
      </template>
    </AdministrationModal>
  </section>
</template>
