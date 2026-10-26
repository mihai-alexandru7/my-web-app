<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="bookstore-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
    </div>
    <slot />
  </section>
</template>

<style scoped>
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