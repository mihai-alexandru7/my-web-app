<script setup lang="ts">

import type { BookItem } from '@/components/BookCard.vue'

interface FeaturedBooksResponse {
  topPicks: BookItem[]
  newReleases: BookItem[]
  bestSellers: BookItem[]
}

const { data, pending, error } = await useFetch<FeaturedBooksResponse>('/api/bookstore/featured')

</script>

<template>
  <main class="home-page-container">
    <div class="main-showcase-box">
      <header class="home-hero-header">
        <h1 class="home-hero-title">Welcome to the Bookstore</h1>
        <p class="home-hero-description">Discover curated literature, recent arrivals, and readers' favorite picks.</p>
      </header>

      <div v-if="pending" class="loading-state-container">
        <p class="loading-state-text">Loading catalog selections…</p>
      </div>

      <div v-else-if="error" class="error-state-container">
        <p class="error-state-text">Could not load featured books. Please try again later.</p>
      </div>

      <div v-else class="showcase-sections-stack">
        <section class="secondary-carousel-box">
          <header class="carousel-box-header">
            <h2 class="carousel-box-title">Top Picks</h2>
            <NuxtLink to="/bookstore" class="carousel-explore-link">Browse all</NuxtLink>
          </header>
          <div v-if="data?.topPicks.length" class="carousel-container-wrapper">
            <BookCarousel :books="data.topPicks" :autoplay-interval="6000" />
          </div>
          <p v-else class="empty-selection-message">No books available in this section yet.</p>
        </section>

        <section class="secondary-carousel-box">
          <header class="carousel-box-header">
            <h2 class="carousel-box-title">New Releases</h2>
            <NuxtLink to="/bookstore" class="carousel-explore-link">Browse all</NuxtLink>
          </header>
          <div v-if="data?.newReleases.length" class="carousel-container-wrapper">
            <BookCarousel :books="data.newReleases" :autoplay-interval="6500" />
          </div>
          <p v-else class="empty-selection-message">No books available in this section yet.</p>
        </section>

        <section class="secondary-carousel-box">
          <header class="carousel-box-header">
            <h2 class="carousel-box-title">Best Sellers</h2>
            <NuxtLink to="/bookstore" class="carousel-explore-link">Browse all</NuxtLink>
          </header>
          <div v-if="data?.bestSellers.length" class="carousel-container-wrapper">
            <BookCarousel :books="data.bestSellers" :autoplay-interval="7000" />
          </div>
          <p v-else class="empty-selection-message">No books available in this section yet.</p>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>

.home-page-container {
  min-height: 100vh;
  padding: 100px 24px 60px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.main-showcase-box {
  width: 100%;
  max-width: 1200px;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-extra-large);
  padding: 40px;
  box-shadow: var(--box-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-sizing: border-box;
}

.home-hero-header {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1.5px solid var(--color-border-subtle);
}

.home-hero-title {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.home-hero-description {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-text-muted);
}

.showcase-sections-stack {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.secondary-carousel-box {
  background: var(--color-background-surface-section);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--border-radius-large);
  padding: 24px 28px;
  box-shadow: var(--box-shadow-card);
}

.carousel-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 2px solid var(--color-action-primary);
}

.carousel-box-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-action-primary);
}

.carousel-explore-link {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-action-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}

.carousel-explore-link:hover {
  color: var(--color-action-primary-hover);
}

.carousel-container-wrapper {
  padding: 0 8px;
}

.empty-selection-message,
.loading-state-text,
.error-state-text {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 1.05rem;
  padding: 30px 10px;
  margin: 0;
}

.error-state-text {
  color: var(--color-status-danger);
}

@media (max-width: 768px) {
  .main-showcase-box {
    padding: 20px 14px;
  }
  .secondary-carousel-box {
    padding: 18px 14px;
  }
  .home-hero-title {
    font-size: 2rem;
  }
}

</style>