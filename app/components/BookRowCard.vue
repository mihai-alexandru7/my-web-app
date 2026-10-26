<script setup lang="ts">

import { formatPrice } from '@/utils/formatters'

const props = defineProps<{
  bookId: number
  title: string
  publisherName?: string
  coverPath?: string | null
  hasCover?: boolean
  price?: string | number | null
  detailLink?: string
}>()

const coverExists = computed(() => props.hasCover ?? Boolean(props.coverPath))

</script>

<template>
  <article class="book-row-card">
    <div class="book-cover-container">
      <NuxtLink v-if="detailLink" :to="detailLink">
        <CoverThumbnail :book-id="bookId" :title="title" :has-cover="coverExists" />
      </NuxtLink>
      <CoverThumbnail v-else :book-id="bookId" :title="title" :has-cover="coverExists" />
    </div>

    <div class="book-details-container">
      <NuxtLink v-if="detailLink" :to="detailLink" class="book-title-link">
        <h3 class="book-title-heading">{{ title }}</h3>
      </NuxtLink>
      <h3 v-else class="book-title-heading">{{ title }}</h3>

      <span v-if="publisherName" class="book-publisher-name">{{ publisherName }}</span>
      <span v-if="price !== undefined && price !== null" class="book-price-text">{{ formatPrice(price) }}</span>

      <div v-if="$slots.meta" class="book-meta-slot">
        <slot name="meta" />
      </div>

      <div v-if="$slots.actions" class="book-actions-container">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<style scoped>

.book-row-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-background-surface-alternate);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-medium);
  box-sizing: border-box;
}

.book-cover-container {
  flex-shrink: 0;
}

.book-details-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.book-title-link {
  text-decoration: none;
  color: var(--color-text-primary);
}

.book-title-heading {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-action-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-publisher-name {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.book-price-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-action-primary);
  margin-top: 2px;
}

.book-meta-slot {
  margin-top: 2px;
}

.book-actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

</style>