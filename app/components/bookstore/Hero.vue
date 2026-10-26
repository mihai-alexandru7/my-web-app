<script setup lang="ts">
const props = defineProps<{
  title: string
  author: string
  coverUrl: string
}>()

const bookCoverImage = ref<HTMLImageElement | null>(null)
const ambientBackgroundColor = ref('rgba(245, 232, 170, 0.4)')

function extractBookCoverColor() {
  const image = bookCoverImage.value
  if (!image) return

  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = image.naturalWidth || image.width
    canvas.height = image.naturalHeight || image.height
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const data = context.getImageData(centerX, centerY, 1, 1).data
    ambientBackgroundColor.value = `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.4)`
  } catch (e) {
    console.warn('Could not extract ambient color:', e)
  }
}

const ambientStyle = computed(() => ({
  background: `linear-gradient(135deg, ${ambientBackgroundColor.value} 0%, rgba(255, 255, 255, 0.8) 80%)`,
}))
</script>

<template>
  <section class="hero-section" :style="ambientStyle">
    <div class="book-cover">
      <img
          ref="bookCoverImage"
          :src="coverUrl"
          :alt="title"
          crossorigin="anonymous"
          @load="extractBookCoverColor"
      />
    </div>
    <div class="book-details">
      <h1 class="book-title">{{ title }}</h1>
      <h3 class="book-author">{{ author }}</h3>
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
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

.book-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-title {
  margin: 0;
  font-family: serif;
  font-size: 2.5rem;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.book-author {
  margin: 0;
  font-family: serif;
  font-size: 1.8rem;
  color: #556877;
}

@media (max-width: 640px) {
  .hero-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>