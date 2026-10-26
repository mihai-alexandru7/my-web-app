<script setup lang="ts">

import { formatPrice } from '@/utils/formatters'

export interface BookItem {
  id: number
  title: string
  price: string | number
  coverPath?: string | null
  cover?: string | null
  authors?: string[] | string
}

defineProps<{
  book: BookItem
}>()

</script>

<template>
  <div class="book-card-container">
    <NuxtLink :to="`/bookstore/${book.id}`" class="book-cover-navigation-link">
      <img
          v-if="book.cover || book.coverPath"
          :src="book.cover || `/api/books/${book.id}/cover`"
          :alt="book.title"
          class="book-cover-image"
      />
      <div v-else class="book-cover-placeholder">
        <span>{{ book.title }}</span>
      </div>
    </NuxtLink>

    <div class="book-meta-information">
      <NuxtLink :to="`/bookstore/${book.id}`" class="book-title-navigation-link">
        <h3 class="book-title-heading">{{ book.title }}</h3>
      </NuxtLink>
      <p v-if="book.authors" class="book-author-text">
        {{ Array.isArray(book.authors) ? book.authors.join(', ') : book.authors }}
      </p>
      <span class="book-price-badge">{{ formatPrice(book.price) }}</span>
    </div>
  </div>
</template>

<style scoped>

.book-card-container {
  display: flex;
  flex-direction: column;
  width: 170px;
  box-sizing: border-box;
}

.book-cover-navigation-link {
  display: block;
  width: 170px;
  height: 250px;
  overflow: hidden;
  border-radius: var(--border-radius-small);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--color-background-surface-alternate);
}

.book-cover-navigation-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

.book-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.book-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  box-sizing: border-box;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.book-meta-information {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 10px;
}

.book-title-navigation-link {
  text-decoration: none;
  color: var(--color-text-primary);
}

.book-title-navigation-link:hover .book-title-heading {
  color: var(--color-action-primary);
}

.book-title-heading {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-author-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price-badge {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-action-primary);
  margin-top: 2px;
}

</style>