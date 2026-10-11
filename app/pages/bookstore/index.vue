<template>
  <main class="bookstore-main">
    <header class="bookstore-header">
    </header>
    <section class="bookstore-section">
      <div class="section-header">
        <h2>Top Picks</h2>
      </div>
      <BookCarousel :books="topPicksBooks" :autoplay-interval="6000" />
    </section>
    <section class="bookstore-section">
      <div class="section-header">
        <h2>Classics</h2>
      </div>
      <BookCarousel :books="classicBooks" :autoplay-interval="6000" />
    </section>
  </main>
</template>

<script setup>

import BookCarousel from '@/components/BookCarousel.vue'
import { useBooks } from '@/composables/useBooks'

const { topPicksBooks, classicBooks } = useBooks()

</script>

<style scoped>

.bookstore-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: sans-serif;
  background-color: #fcfcfc;
  min-height: 100vh;
}

.bookstore-header {
  text-align: center;
  margin-bottom: 50px;
}

.bookstore-header h1 {
  font-family: serif;
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.bookstore-header p {
  color: #666;
  font-size: 1.1rem;
}

.bookstore-section {
  margin-bottom: 50px;
  background: #ffffff;
  padding: 30px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.section-header {
  max-width: 1200px;
  margin: 0 auto 20px auto;
  padding: 0 40px;
}

.section-header h2 {
  font-family: serif;
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

</style>