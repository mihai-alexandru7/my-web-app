<script setup lang="ts">

defineProps<{
  label: string
  value: string | number
}>()

</script>

<template>
  <div class="stat-card">
    <span class="stat-card-label">{{ label }}</span>
    <span class="stat-card-value">{{ value }}</span>
  </div>
</template>

<style scoped>

.stat-card {
  background: var(--color-background-surface-card);
  border: 1px solid var(--color-border-card);
  border-left: 5px solid var(--color-action-primary);
  border-radius: var(--border-radius-medium);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-card-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.stat-card-value {
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--color-action-primary);
}

</style>