<script setup lang="ts">

defineProps<{
  label: string
  options: { value: string | number; label: string }[]
  required?: boolean
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<string | number>({ required: true })

</script>

<template>
  <div class="select-field-wrapper">
    <label class="select-field-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <select v-model="model" class="select-field-control" :required="required" :disabled="disabled">
      <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>

.select-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.select-field-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required-indicator {
  color: var(--color-status-danger);
}

.select-field-control {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 0.98rem;
  color: var(--color-text-primary);
  background: var(--color-background-field);
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
}

.select-field-control:focus {
  outline: 2px solid var(--color-action-primary);
  outline-offset: 1px;
}

</style>