<script setup lang="ts">

defineProps<{
  message: string
  actionLabel?: string
  actionTo?: string
}>()

</script>

<template>
  <div class="empty-state-container">
    <p class="empty-state-message">{{ message }}</p>
    <NuxtLink v-if="actionLabel && actionTo" :to="actionTo" class="empty-state-action-link">
      {{ actionLabel }}
    </NuxtLink>
  </div>
</template>

<style scoped>

.empty-state-container {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted);
  font-size: 1.15rem;
}

.empty-state-message {
  margin: 0;
}

.empty-state-action-link {
  color: var(--color-action-primary);
  text-decoration: underline;
  display: inline-block;
  margin-top: 10px;
  font-weight: 600;
}

</style>