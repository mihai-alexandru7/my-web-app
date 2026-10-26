<script setup lang="ts">

defineProps<{
  bookId: number
  title: string
  hasCover: boolean
}>()

</script>

<template>
  <img
      v-if="hasCover"
      :src="`/api/books/${bookId}/cover`"
      :alt="`Cover of ${title}`"
      class="cover-thumbnail"
  />
  <div v-else class="cover-thumbnail cover-thumbnail-empty">No cover</div>
</template>

<style scoped>

.cover-thumbnail {
  display: block;
  width: 44px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border-group);
  background: #f1efe6;
}

.cover-thumbnail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

</style>