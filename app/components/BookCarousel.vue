<script setup lang="ts">

import type { BookItem } from '@/components/BookCard.vue'

const props = withDefaults(
    defineProps<{
      books: BookItem[]
      autoplayInterval?: number
    }>(),
    {
      autoplayInterval: 5000
    }
)

const trackElement = ref<HTMLElement | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const scrollPrevious = () => {
  if (!trackElement.value) return
  trackElement.value.scrollBy({
    left: -200,
    behavior: 'smooth'
  })
}

const scrollNext = () => {
  if (!trackElement.value) return
  const container = trackElement.value
  if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
    container.scrollTo({ left: 0, behavior: 'smooth' })
  } else {
    container.scrollBy({
      left: 200,
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

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})

</script>

<template>
  <div class="carousel-outer-wrapper" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
    <button
        type="button"
        class="carousel-navigation-button previous-navigation-button"
        aria-label="Previous books"
        @click="scrollPrevious"
    >
      &#10094;
    </button>

    <div ref="trackElement" class="carousel-items-track">
      <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          class="carousel-item-element"
      />
    </div>

    <button
        type="button"
        class="carousel-navigation-button next-navigation-button"
        aria-label="Next books"
        @click="scrollNext"
    >
      &#10095;
    </button>
  </div>
</template>

<style scoped>

.carousel-outer-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.carousel-items-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  width: 100%;
  padding: 10px 4px 14px;
}

.carousel-items-track::-webkit-scrollbar {
  display: none;
}

.carousel-item-element {
  flex: 0 0 auto;
}

.carousel-navigation-button {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  background-color: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  color: var(--color-action-primary);
  font-size: 1.1rem;
  width: 42px;
  height: 42px;
  border-radius: var(--border-radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(45, 35, 10, 0.15);
  transition: all 0.2s ease;
}

.carousel-navigation-button:hover {
  background-color: var(--color-background-surface-alternate);
  transform: translateY(-50%) scale(1.08);
}

.previous-navigation-button {
  left: -20px;
}

.next-navigation-button {
  right: -20px;
}

@media (max-width: 768px) {
  .previous-navigation-button {
    left: 4px;
  }
  .next-navigation-button {
    right: 4px;
  }
}

</style>