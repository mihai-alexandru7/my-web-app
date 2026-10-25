<script setup lang="ts">

import { formatDate } from '@/utils/formatters'

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
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <div>
    <form class="administration-card administration-form" @submit.prevent="applyFilters">
      <input
          v-model.number="bookIdInput"
          class="administration-input administration-input-narrow"
          type="number"
          min="1"
          placeholder="Book ID"
          aria-label="Filter by book ID"
      />
      <input
          v-model.number="userIdInput"
          class="administration-input administration-input-narrow"
          type="number"
          min="1"
          placeholder="User ID"
          aria-label="Filter by user ID"
      />
      <button class="administration-button administration-button-primary" type="submit">Filter</button>
      <button class="administration-button" type="button" @click="clearFilters">Clear</button>
    </form>

    <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>

    <div class="administration-table-wrapper">
      <table class="administration-table">
        <thead>
        <tr>
          <th>Book</th>
          <th>Reader</th>
          <th>Rating</th>
          <th>Comment</th>
          <th>Date</th>
          <th style="width: 180px; text-align: right;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="review in reviews" :key="review.id">
          <td>{{ review.bookTitle }} <span class="administration-muted">#{{ review.bookId }}</span></td>
          <td>{{ review.userFirstName }} {{ review.userLastName }} <span class="administration-muted">#{{ review.userId }}</span></td>
          <td>{{ review.rating ? `${review.rating} / 5` : '—' }}</td>
          <td class="administration-comment">{{ review.comment || '—' }}</td>
          <td>{{ formatDate(review.createdAt) }}</td>
          <td class="administration-actions" style="justify-content: flex-end;">
            <button class="administration-button administration-button-small administration-button-danger" type="button" :disabled="busy" @click="remove(review)">
              Delete
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <p v-if="!reviews.length" class="administration-empty">{{ pending ? 'Loading…' : 'No reviews found.' }}</p>
    </div>

    <AdministrationPager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />
  </div>
</template>
