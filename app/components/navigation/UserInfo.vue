<script setup lang="ts">

defineProps<{
  displayName?: string
  email: string
}>()

</script>

<template>
  <div class="user-info-container">
    <span v-if="displayName" class="user-info-name">{{ displayName }}</span>
    <span class="user-info-email">{{ email }}</span>
  </div>
</template>

<style scoped>

.user-info-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
  padding: 10px 14px;
  background: var(--color-background-surface-alternate);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-medium);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  text-align: center;
  word-break: break-all;
}

.user-info-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-action-primary);
}

</style>