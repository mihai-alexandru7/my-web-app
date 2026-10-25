<script setup lang="ts">

import '@/assets/css/account.css'

export interface FormProps {
  submitLabel: string
  pendingLabel?: string
  submitting?: boolean
  canSubmit?: boolean
  error?: string
  hideSubmit?: boolean
}

withDefaults(defineProps<FormProps>(), {
  submitting: false,
  canSubmit: true,
  error: '',
  hideSubmit: false
})

const emit = defineEmits<{
  submit: []
}>()

</script>

<template>
  <form class="account-form" novalidate @submit.prevent="emit('submit')">
    <fieldset class="account-form-fields" :disabled="submitting">
      <slot />
    </fieldset>
    <p v-if="error" class="account-form-error" role="alert">
      {{ error }}
    </p>
    <button
        v-if="!hideSubmit"
        type="submit"
        class="account-form-submit"
        :disabled="!canSubmit || submitting"
    >
      {{ submitting ? (pendingLabel ?? submitLabel) : submitLabel }}
    </button>
  </form>
</template>

<style scoped>

.account-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.account-form-error {
  margin: 0;
  color: var(--account-error);
  font-size: 0.9rem;
}

.account-form-submit {
  padding: 11px 18px;
  font: inherit;
  color: var(--account-on-accent);
  background: var(--account-accent);
  border: 1px solid var(--account-accent);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.account-form-submit:hover:not(:disabled) {
  background: var(--account-accent-hover);
}

.account-form-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.account-form-submit:focus-visible {
  outline: 2px solid var(--account-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .account-form-submit {
    transition: none;
  }
}

</style>
