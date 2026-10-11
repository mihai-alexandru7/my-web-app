<template>
  <main class="book-page" v-if="book">
    <article class="book-article">
      <section class="hero-section" :style="ambientBackground">
        <div class="book-cover">
          <img ref="bookCoverImage" :src="book.cover" :alt="book.title" @load="extractBookCoverColor" crossorigin="anonymous" />
        </div>
        <div class="book-details">
          <h1 class="book-title">{{ book.title }}</h1>
          <h3 class="book-author">{{ book.author }}</h3>
        </div>
      </section>
      <section class="publisher-description-section">
        <div class="publisher-description-headline">
          <h2>Publisher Description</h2>
        </div>
        <div class="publisher-description-content" :class="{ 'expanded': showAll }">
          <p v-for="(paragraph, index) in paragraphs" :key="index">
            {{ paragraph }}
          </p>
          <div v-if="!showAll && paragraphs.length > 1" class="fade-overlay">
            <button @click="showAll = true" class="read-more-button">
              Read more
            </button>
          </div>
        </div>
        <button v-if="showAll && paragraphs.length > 1" @click="showAll = false" class="read-less-button">
          Read less
        </button>
      </section>
    </article>
  </main>
  <div v-else class="not-found">
    <p>Cartea căutată nu a fost găsită.</p>
    <NuxtLink to="/bookstore">Înapoi la librărie</NuxtLink>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBooks } from '@/composables/useBooks'

const route = useRoute()
const { getBookBySlug } = useBooks()

const book = computed(() => {
  return getBookBySlug(route.params.slug)
})

const bookCoverImage = ref(null)
const ambientBackgroundColor = ref('rgba(245, 232, 170, 0.4)')

const extractBookCoverColor = () => {
  const image = bookCoverImage.value
  if (!image) return

  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = image.naturalWidth || image.width
    canvas.height = image.naturalHeight || image.height
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const data = context.getImageData(centerX, centerY, 1, 1).data
    ambientBackgroundColor.value = `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.4)`
  } catch (e) {
    console.log(e)
  }
}

const ambientBackground = computed(() => {
  return {
    background: `linear-gradient(135deg, ${ambientBackgroundColor.value} 0%, rgba(255, 255, 255, 0.8) 80%)`
  }
})

const showAll = ref(false)

const paragraphs = computed(() => {
  const description = book.value?.description || ''
  if (!description) return []
  return description.split('\n\n').filter(paragraph => paragraph.trim() !== '')
})

</script>

<style scoped>

.book-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.not-found {
  text-align: center;
  padding: 100px 20px;
  font-family: sans-serif;
  color: #666;
}

.book-article {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.hero-section {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: background 0.8s ease-in-out;
}

.book-cover {
  width: 200px;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.book-cover img {
  width: 100%;
  display: block;
  border-radius: 8px;
}

.book-title {
  font-family: serif;
  font-size: 2.5rem;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.book-author {
  font-family: serif;
  font-size: 2rem;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.publisher-description-section {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.publisher-description-headline {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.publisher-description-content {
  position: relative;
  max-height: 160px;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
}

.publisher-description-content.expanded {
  max-height: 1000px;
}

.publisher-description-content p {
  color: #444;
  line-height: 1.7;
  margin-bottom: 15px;
  text-align: justify;
  text-justify: inter-word;
}

.fade-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
}

.read-more-button {
  background-color: #F6E2B9;
  color: #2c3e50;
  border: none;
  padding: 8px 22px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(246, 226, 185, 0.4);
  transition: background-color 0.2s, transform 0.2s;
}

.read-more-button:hover {
  background-color: #e6cd9d;
  transform: translateY(-1px);
}

.read-less-button {
  background: none;
  border: none;
  color: #8c7853;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-top: 15px;
}

.read-less-button:hover {
  text-decoration: underline;
}

</style>