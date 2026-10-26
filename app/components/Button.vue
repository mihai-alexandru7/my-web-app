<script setup lang="ts">

withDefaults(
    defineProps<{
      variant?: 'primary' | 'outline' | 'danger'
      size?: 'small' | 'medium'
      type?: 'button' | 'submit'
      disabled?: boolean
    }>(),
    {
      variant: 'primary',
      size: 'medium',
      type: 'button',
      disabled: false
    }
)

</script>

<template>
  <button
      :type="type"
      :disabled="disabled"
      class="action-button"
      :class="[`action-button-${variant}`, `action-button-${size}`]"
  >
    <slot />
  </button>
</template>

<style scoped>

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-button-small {
  padding: 6px 14px;
  font-size: 0.88rem;
}

.action-button-medium {
  padding: 10px 20px;
  font-size: 0.98rem;
}

.action-button-primary {
  background: var(--color-action-primary);
  border: 1.5px solid var(--color-action-primary);
  color: var(--color-action-on-primary);
}

.action-button-primary:hover:not(:disabled) {
  background: var(--color-action-primary-hover);
  border-color: var(--color-action-primary-hover);
}

.action-button-outline {
  background: var(--color-background-field);
  border: 1.5px solid var(--color-action-primary);
  color: var(--color-action-primary);
}

.action-button-outline:hover:not(:disabled) {
  background: var(--color-background-surface-alternate);
}

.action-button-danger {
  background: var(--color-background-field);
  border: 1.5px solid var(--color-status-danger-border);
  color: var(--color-status-danger);
}

.action-button-danger:hover:not(:disabled) {
  background: var(--color-status-danger-background);
  border-color: var(--color-status-danger);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>