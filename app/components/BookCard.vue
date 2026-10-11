<template>
  <div class="book-card" v-if="book">
    <NuxtLink :to="`/bookstore/${book?.slug}`" class="book-cover-link">
      <img :src="book?.cover" :alt="book?.title" class="book-cover" />
    </NuxtLink>
  </div>
</template>

<script setup>

defineProps({
  book: {
    type: Object,
    required: true
  }
})

</script>

<style scoped>

.book-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.book-cover-link {
  display: inline-block;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.book-cover-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

.book-cover {
  width: 160px;
  height: 240px;
  display: block;
  object-fit: cover;
}

</style>