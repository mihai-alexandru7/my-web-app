<template>
  <div class="book-carousel-container" @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
    <button class="carousel-button previous-button" @click="scrollPrevious">
      &#10094;
    </button>
    <div class="carousel-track" ref="trackRef">
      <BookCard v-for="book in books" :key="book.id" :book="book" class="carousel-item" />
    </div>
    <button class="carousel-button next-button" @click="scrollNext">
      &#10095;
    </button>
  </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import BookCard from '@/components/BookCard.vue'

const props = defineProps({
  books: {
    type: Array,
    required: true,
    default: () => []
  },
  autoplayInterval: {
    type: Number,
    default: 4000
  }
})

const trackRef = ref(null)
let autoplayTimer = null

const scrollPrevious = () => {
  if (!trackRef.value) return
  const card = trackRef.value.querySelector('.carousel-item')
  const cardWidth = card ? card.offsetWidth + 20 : 180
  trackRef.value.scrollBy({
    left: -cardWidth,
    behavior: 'smooth'
  })
}

const scrollNext = () => {
  if (!trackRef.value) return
  const container = trackRef.value
  const card = container.querySelector('.carousel-item')
  const cardWidth = card ? card.offsetWidth + 20 : 180
  if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
    container.scrollTo({ left: 0, behavior: 'smooth' })
  } else {
    container.scrollBy({
      left: cardWidth,
      behavior: 'smooth'
    })
  }
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    scrollNext()
  }, props.autoplayInterval)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

const pauseAutoplay = () => {
  stopAutoplay()
}

const resumeAutoplay = () => {
  startAutoplay()
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

</script>

<style scoped>

.book-carousel-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 20px 40px;
}

.carousel-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  padding: 10px 0;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-item {
  flex: 0 0 auto;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  color: #333;
  font-size: 1.1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
}

.carousel-button:hover {
  background-color: #f8f9fa;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.previous-button {
  left: 0;
}

.next-button {
  right: 0;
}

</style>