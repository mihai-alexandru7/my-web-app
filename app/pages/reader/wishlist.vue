<script setup lang="ts">

import { formatPrice, formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'

definePageMeta({ middleware: 'reader' })
useSeoMeta({ title: 'My Wishlist' })

const { loggedIn } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/account/sign-in?redirect=/reader/wishlist')
}

interface WishlistItem {
  bookId: number
  title: string
  price: string
  coverPath: string | null
  status: string
  publisherName: string
  addedAt: string
}

const { data, refresh, pending } = await useFetch<{ items: WishlistItem[] }>('/api/wishlist')
const items = computed(() => data.value?.items ?? [])

const busyBookId = ref<number | null>(null)
const feedbackMessage = ref('')
const errorMessage = ref('')

async function moveToCart(bookId: number) {
  busyBookId.value = bookId
  feedbackMessage.value = ''
  errorMessage.value = ''
  try {
    await $fetch(`/api/wishlist/${bookId}/move-to-cart`, { method: 'POST' })
    feedbackMessage.value = 'Book moved to cart.'
    await refresh()
  } catch (caughtError) {
    errorMessage.value = getErrorMessage(caughtError)
  } finally {
    busyBookId.value = null
  }
}

async function removeFromWishlist(bookId: number) {
  busyBookId.value = bookId
  feedbackMessage.value = ''
  errorMessage.value = ''
  try {
    await $fetch(`/api/wishlist/${bookId}`, { method: 'DELETE' })
    await refresh()
  } catch (caughtError) {
    errorMessage.value = getErrorMessage(caughtError)
  } finally {
    busyBookId.value = null
  }
}

</script>

<template>
  <PageContainer title="My Wishlist" subtitle="Saved books you want to purchase later.">
    <AlertNotice v-if="feedbackMessage" variant="success" :message="feedbackMessage" />
    <AlertNotice v-if="errorMessage" variant="danger" :message="errorMessage" />

    <div v-if="pending">
      <EmptyState message="Loading wishlist…" />
    </div>

    <div v-else-if="items.length" class="wishlist-cards-grid">
      <BookRowCard
          v-for="item in items"
          :key="item.bookId"
          :book-id="item.bookId"
          :title="item.title"
          :publisher-name="item.publisherName"
          :cover-path="item.coverPath"
          :price="item.price"
      >
        <template #meta>
          <span class="book-date-text">Added on {{ formatDate(item.addedAt) }}</span>
        </template>

        <template #actions>
          <Button
              size="small"
              :disabled="busyBookId === item.bookId || item.status !== 'approved'"
              @click="moveToCart(item.bookId)"
          >
            {{ item.status === 'approved' ? 'Move to Cart' : 'Unavailable' }}
          </Button>
          <Button
              variant="danger"
              size="small"
              :disabled="busyBookId === item.bookId"
              @click="removeFromWishlist(item.bookId)"
          >
            Remove
          </Button>
        </template>
      </BookRowCard>
    </div>

    <EmptyState
        v-else
        message="Your wishlist is currently empty."
        action-label="Discover books in Bookstore"
        action-to="/bookstore"
    />
  </PageContainer>
</template>

<style scoped>

.wishlist-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.book-date-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

</style>