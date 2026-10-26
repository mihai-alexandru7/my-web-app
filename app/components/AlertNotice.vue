<script setup lang="ts">

withDefaults(
    defineProps<{
      variant?: 'success' | 'danger'
      message?: string
    }>(),
    {
      variant: 'success'
    }
)

</script>

<template>
  <div class="alert-notice-box" :class="`alert-notice-${variant}`" role="alert">
    <slot>{{ message }}</slot>
  </div>
</template>

<style scoped>

.alert-notice-box {
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--border-radius-small);
  font-size: 0.95rem;
  font-weight: 600;
  box-sizing: border-box;
}

.alert-notice-success {
  background: var(--color-status-success-background);
  border: 1.5px solid var(--color-status-success);
  color: var(--color-status-success);
}

.alert-notice-danger {
  background: var(--color-status-danger-background);
  border: 1.5px solid var(--color-status-danger);
  color: var(--color-status-danger);
}

</style>