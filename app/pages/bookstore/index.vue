<script setup lang="ts">

import type { BookItem } from '@/components/BookCard.vue'

useSeoMeta({ title: 'Bookstore' })

interface NamedEntity {
  id: number
  name: string
}

interface OverviewResponse {
  genres: { id: number; name: string; books: BookItem[] }[]
}

interface CatalogResponse {
  items: BookItem[]
  total: number
}

const { data: genresData } = await useFetch<{ genres: NamedEntity[] }>('/api/genres')
const { data: categoriesData } = await useFetch<{ categories: NamedEntity[] }>('/api/categories')
const { data: languagesData } = await useFetch<{ languages: { id: number; code: string; name: string }[] }>('/api/languages')
const { data: overviewData, pending: overviewPending } = await useFetch<OverviewResponse>('/api/bookstore/overview')

const searchQuery = ref('')
const selectedGenre = ref<number | ''>('')
const selectedCategory = ref<number | ''>('')
const selectedLanguage = ref<number | ''>('')
const minPrice = ref<number | ''>('')
const maxPrice = ref<number | ''>('')
const sortBy = ref<'newest' | 'price-asc' | 'price-desc' | 'title'>('newest')
const page = ref(1)
const pageSize = 20

const isFiltering = computed(() => {
  return Boolean(
      searchQuery.value.trim() ||
      selectedGenre.value !== '' ||
      selectedCategory.value !== '' ||
      selectedLanguage.value !== '' ||
      minPrice.value !== '' ||
      maxPrice.value !== '' ||
      sortBy.value !== 'newest'
  )
})

const queryParams = computed(() => ({
  search: searchQuery.value.trim() || undefined,
  genreId: selectedGenre.value !== '' ? Number(selectedGenre.value) : undefined,
  categoryId: selectedCategory.value !== '' ? Number(selectedCategory.value) : undefined,
  languageId: selectedLanguage.value !== '' ? Number(selectedLanguage.value) : undefined,
  minPrice: minPrice.value !== '' ? Number(minPrice.value) : undefined,
  maxPrice: maxPrice.value !== '' ? Number(maxPrice.value) : undefined,
  sortBy: sortBy.value,
  page: page.value,
  pageSize
}))

const { data: catalogData, pending: catalogPending, refresh: refreshCatalog } = await useFetch<CatalogResponse>('/api/bookstore', {
  query: queryParams,
  watch: [queryParams]
})

function resetFilters() {
  searchQuery.value = ''
  selectedGenre.value = ''
  selectedCategory.value = ''
  selectedLanguage.value = ''
  minPrice.value = ''
  maxPrice.value = ''
  sortBy.value = 'newest'
  page.value = 1
}

</script>

<template>
  <main class="bookstore-page-layout">
    <div class="bookstore-main-container">
      <header class="bookstore-main-header">
        <div class="bookstore-title-container">
          <h1 class="bookstore-heading-title">Bookstore</h1>
          <p class="bookstore-heading-subtitle">Discover our catalog and filter your favorite books.</p>
        </div>
      </header>

      <!-- Panoul de Căutare și Filtrare -->
      <section class="filters-panel">
        <div class="filter-row">
          <input
              v-model="searchQuery"
              type="search"
              class="filter-input search-input"
              placeholder="Search by title or author…"
          />

          <select v-model="selectedGenre" class="filter-select">
            <option value="">All Genres</option>
            <option v-for="g in genresData?.genres" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>

          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="c in categoriesData?.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>

          <select v-model="selectedLanguage" class="filter-select">
            <option value="">All Languages</option>
            <option v-for="l in languagesData?.languages" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>

        <div class="filter-row secondary-row">
          <div class="price-range">
            <input v-model.number="minPrice" type="number" min="0" placeholder="Min price" class="filter-input price-input" />
            <span>—</span>
            <input v-model.number="maxPrice" type="number" min="0" placeholder="Max price" class="filter-input price-input" />
          </div>

          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <Button v-if="isFiltering" variant="outline" size="small" @click="resetFilters">
            Reset Filters
          </Button>
        </div>
      </section>

      <!-- Rezultate filtrate sau Catalog complet -->
      <section v-if="isFiltering" class="catalog-section">
        <div class="catalog-header">
          <h2>Catalog Results ({{ catalogData?.total ?? 0 }} titles)</h2>
        </div>

        <div v-if="catalogPending" class="state-message">
          <p>Filtering books…</p>
        </div>

        <div v-else-if="catalogData?.items.length" class="books-grid">
          <BookCard v-for="book in catalogData.items" :key="book.id" :book="book" />
        </div>

        <div v-else class="state-message">
          <p>No books match your selected filters.</p>
        </div>

        <Pager v-model:page="page" :total="catalogData?.total ?? 0" :page-size="pageSize" />
      </section>

      <div v-else class="bookstore-carousels-stack">
        <div v-if="overviewPending" class="state-message">
          <p>Loading bookstore catalog…</p>
        </div>

        <template v-else-if="overviewData?.genres.length">
          <section v-for="group in overviewData.genres" :key="group.id" class="secondary-genre-box">
            <header class="secondary-box-header">
              <h2 class="secondary-box-title">{{ group.name }}</h2>
              <span class="secondary-box-count">{{ group.books.length }} titles</span>
            </header>

            <div class="carousel-wrapper">
              <BookCarousel :books="group.books" :autoplay-interval="7000" />
            </div>
          </section>
        </template>

        <div v-else class="state-message">
          <p>No published books are currently available in the bookstore.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>

.bookstore-page-layout {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.bookstore-main-container {
  width: 80%;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-extra-large);
  padding: 36px;
  box-shadow: var(--box-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

.bookstore-main-header {
  padding-bottom: 18px;
  border-bottom: 2px solid var(--color-border-main);
}

.bookstore-heading-title {
  margin: 0 0 6px 0;
  font-size: 2.3rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.bookstore-heading-subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-text-muted);
}

.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-background-surface-alternate);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--border-radius-medium);
  padding: 16px 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.95rem;
}

.search-input {
  flex: 1;
  min-width: 220px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-input {
  width: 100px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.secondary-genre-box {
  background: var(--color-background-surface-section);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--border-radius-large);
  padding: 24px 28px;
  box-shadow: var(--box-shadow-card);
  margin-bottom: 24px;
}

.secondary-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--color-action-primary);
}

.secondary-box-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-action-primary);
}

.secondary-box-count {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.state-message {
  text-align: center;
  padding: 50px 20px;
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .bookstore-main-container {
    width: 95%;
    padding: 20px 16px;
  }
}

</style>