<script setup lang="ts">

defineProps<{
  label: string
  value?: string | number | null
}>()

</script>

<template>
  <div class="detail-box-container">
    <span class="detail-box-label">{{ label }}</span>
    <slot>
      <span class="detail-box-value">{{ value || '—' }}</span>
    </slot>
  </div>
</template>

<style scoped>

.detail-box-container {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: var(--color-background-surface-card);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-medium);
  box-sizing: border-box;
}

.detail-box-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  font-weight: 600;
}

.detail-box-value {
  font-size: 1.05rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

</style>