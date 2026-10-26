<script setup lang="ts">

import { formatPrice, formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'

const route = useRoute()
const bookId = Number(route.params.id)

const { loggedIn } = useUserSession()

interface NamedEntity {
  id: number
  name: string
}

interface ReviewItem {
  id: number
  rating: number | null
  comment: string | null
  createdAt: string
  userName: string
}

interface BookDetailResponse {
  book: {
    id: number
    title: string
    description: string | null
    price: string
    coverPath: string | null
    samplePath: string | null
    isbn: string | null
    publishedYear: number | null
    publisherName: string
    language: { id: number; code: string; name: string }
    authors: NamedEntity[]
    genres: NamedEntity[]
    categories: NamedEntity[]
    rating: { average: number; count: number }
    reviews: ReviewItem[]
    userState: { inWishlist: boolean; inCart: boolean; isPurchased: boolean }
  }
}

const { data, refresh, pending, error } = await useFetch<BookDetailResponse>(`/api/books/${bookId}`)
const book = computed(() => data.value?.book)

useSeoMeta({
  title: computed(() => book.value?.title ? `${book.value.title} - Bookstore` : 'Book Details')
})

const isSampleModalOpen = ref(false)
const actionMessage = ref('')
const actionErrorMessage = ref('')
const busy = ref(false)

async function addToCart() {
  if (!loggedIn.value) {
    return navigateTo(`/account/sign-in?redirect=${route.fullPath}`)
  }
  busy.value = true
  actionMessage.value = ''
  actionErrorMessage.value = ''
  try {
    await $fetch('/api/cart', { method: 'POST', body: { bookId } })
    actionMessage.value = 'Book added to your cart.'
    await refresh()
  } catch (caughtError) {
    actionErrorMessage.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

async function addToWishlist() {
  if (!loggedIn.value) {
    return navigateTo(`/account/sign-in?redirect=${route.fullPath}`)
  }
  busy.value = true
  actionMessage.value = ''
  actionErrorMessage.value = ''
  try {
    await $fetch('/api/wishlist', { method: 'POST', body: { bookId } })
    actionMessage.value = 'Book added to your wishlist.'
    await refresh()
  } catch (caughtError) {
    actionErrorMessage.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <main class="book-detail-page">
    <div v-if="pending" class="book-detail-card message-container">
      <p>Loading book details…</p>
    </div>

    <div v-else-if="error || !book" class="book-detail-card message-container">
      <p>The requested book could not be found or is not available.</p>
      <NuxtLink to="/bookstore" class="back-link">Return to Bookstore</NuxtLink>
    </div>

    <article v-else class="book-detail-card">
      <div class="book-overview-grid">
        <div class="book-cover-column">
          <img
              v-if="book.coverPath"
              :src="`/api/books/${book.id}/cover`"
              :alt="`Cover of ${book.title}`"
              class="book-large-cover"
          />
          <div v-else class="book-large-cover cover-fallback">No cover</div>
        </div>

        <div class="book-information-column">
          <header class="book-header-section">
            <h1 class="book-detail-title">{{ book.title }}</h1>
            <p class="book-detail-authors">
              by {{ book.authors.map(a => a.name).join(', ') || 'Unknown Author' }}
            </p>
            <div class="book-rating-summary">
              <span class="rating-stars">★ {{ book.rating.average.toFixed(1) }}</span>
              <span class="rating-count">({{ book.rating.count }} review{{ book.rating.count === 1 ? '' : 's' }})</span>
            </div>
          </header>

          <div class="book-price-box">
            <span class="book-price-value">{{ formatPrice(book.price) }}</span>
          </div>

          <div class="book-purchase-actions">
            <template v-if="book.userState.isPurchased">
              <NuxtLink to="/reader/library" class="action-status-text">
                ✓ You already own this book. View in Library
              </NuxtLink>
            </template>
            <template v-else>
              <Button
                  :disabled="busy || book.userState.inCart"
                  @click="addToCart"
              >
                {{ book.userState.inCart ? 'Already in Cart' : 'Add to Cart' }}
              </Button>
              <Button
                  variant="outline"
                  :disabled="busy || book.userState.inWishlist"
                  @click="addToWishlist"
              >
                {{ book.userState.inWishlist ? 'In Wishlist' : 'Add to Wishlist' }}
              </Button>
            </template>

            <NuxtLink
                v-if="book.samplePath"
                :to="`/read/${book.id}?sample=true`"
            >
              <Button variant="outline">
                Read Free Excerpt
              </Button>
            </NuxtLink>
          </div>

          <p v-if="actionMessage" class="feedback-success-message">{{ actionMessage }}</p>
          <p v-if="actionErrorMessage" class="feedback-error-message">{{ actionErrorMessage }}</p>

          <DescriptionList class="book-metadata-list">
            <dt>Publisher</dt>
            <dd>{{ book.publisherName }}</dd>
            <dt>Language</dt>
            <dd>{{ book.language.name }}</dd>
            <dt>Genres</dt>
            <dd>{{ book.genres.map(g => g.name).join(', ') || '—' }}</dd>
            <dt>Categories</dt>
            <dd>{{ book.categories.map(c => c.name).join(', ') || '—' }}</dd>
            <dt>Published</dt>
            <dd>{{ book.publishedYear || '—' }}</dd>
            <dt>ISBN</dt>
            <dd>{{ book.isbn || '—' }}</dd>
          </DescriptionList>
        </div>
      </div>

      <section class="book-synopsis-section">
        <h2 class="section-headline">Synopsis</h2>
        <div class="synopsis-content">
          <p v-for="(paragraph, index) in (book.description || 'No description available.').split('\n')" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </section>

      <section class="book-reviews-section">
        <h2 class="section-headline">Reader Reviews</h2>

        <div v-if="book.reviews.length" class="reviews-list-stack">
          <article v-for="review in book.reviews" :key="review.id" class="review-entry-card">
            <header class="review-header">
              <strong class="review-author-name">{{ review.userName }}</strong>
              <span class="review-date-text">{{ formatDate(review.createdAt) }}</span>
            </header>
            <div v-if="review.rating" class="review-rating-stars">
              {{ '★'.repeat(review.rating) }}<span class="empty-stars">{{ '★'.repeat(5 - review.rating) }}</span>
            </div>
            <p v-if="review.comment" class="review-comment-text">{{ review.comment }}</p>
          </article>
        </div>
        <p v-else class="no-reviews-text">No reviews yet for this title.</p>
      </section>
    </article>

    <Modal
        v-if="isSampleModalOpen"
        :title="`Free Sample: ${book?.title}`"
        @close="isSampleModalOpen = false"
    >
      <iframe
          :src="`/api/books/${book?.id}/sample`"
          class="sample-preview-iframe"
          title="Book sample preview"
      />
      <template #footer>
        <Button variant="outline" @click="isSampleModalOpen = false">Close preview</Button>
      </template>
    </Modal>
  </main>
</template>

<style scoped>

.book-detail-page {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.book-detail-card {
  width: 80%;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-extra-large);
  padding: 36px;
  box-shadow: var(--box-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-sizing: border-box;
}

.message-container {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.2rem;
  color: var(--color-text-muted);
}

.back-link {
  color: var(--color-action-primary);
  text-decoration: underline;
  margin-top: 14px;
  display: inline-block;
}

.book-overview-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 36px;
  align-items: start;
}

.book-large-cover {
  width: 100%;
  height: 350px;
  object-fit: cover;
  border-radius: var(--border-radius-medium);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-surface-alternate);
  color: var(--color-text-muted);
}

.book-information-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-detail-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.book-detail-authors {
  margin: 6px 0 0;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

.book-rating-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.rating-stars {
  font-weight: 700;
  color: var(--color-status-warning);
}

.rating-count {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.book-price-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-action-primary);
}

.book-purchase-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}

.action-status-text {
  font-weight: 600;
  color: var(--color-status-success);
  text-decoration: underline;
}

.feedback-success-message {
  margin: 0;
  color: var(--color-status-success);
  font-weight: 600;
}

.feedback-error-message {
  margin: 0;
  color: var(--color-status-danger);
  font-weight: 600;
}

.book-metadata-list {
  margin-top: 14px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-subtle);
}

.section-headline {
  margin: 0 0 16px 0;
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--color-action-primary);
  border-bottom: 2px solid var(--color-action-primary);
  padding-bottom: 8px;
}

.synopsis-content p {
  line-height: 1.65;
  margin: 0 0 12px 0;
}

.reviews-list-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-entry-card {
  padding: 16px 20px;
  background: var(--color-background-surface-alternate);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--color-border-subtle);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.review-author-name {
  color: var(--color-action-primary);
}

.review-date-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.review-rating-stars {
  color: var(--color-status-warning);
  margin-bottom: 6px;
}

.empty-stars {
  color: var(--color-border-subtle);
}

.review-comment-text {
  margin: 0;
  line-height: 1.5;
}

.no-reviews-text {
  color: var(--color-text-muted);
}

.sample-preview-iframe {
  width: 100%;
  height: 550px;
  border: 1px solid var(--color-border-main);
  border-radius: var(--border-radius-small);
}

@media (max-width: 900px) {
  .book-detail-card {
    width: 95%;
    padding: 20px;
  }
  .book-overview-grid {
    grid-template-columns: 1fr;
  }
  .book-large-cover {
    height: 300px;
    width: 200px;
    margin: 0 auto;
    display: block;
  }
}

</style>