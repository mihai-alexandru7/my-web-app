<script setup lang="ts">

export interface SelectOption {
  value: string
  title: string
  description: string
}

defineProps<{
  label: string
  options: SelectOption[]
  disabled?: boolean
}>()

const model = defineModel<string>({ required: true })

</script>

<template>
  <fieldset class="option-selector-fieldset" :disabled="disabled">
    <legend class="option-selector-legend">{{ label }}</legend>
    <div class="option-cards-grid">
      <label v-for="option in options" :key="option.value" class="option-selection-card">
        <input v-model="model" type="radio" class="option-radio-input" :value="option.value" />
        <span class="option-card-title">{{ option.title }}</span>
        <span class="option-card-description">{{ option.description }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>

.option-selector-fieldset {
  min-width: 0;
  margin: 0;
  padding: 14px 16px 16px;
  border: 1px solid var(--color-border-group);
  border-radius: var(--border-radius-medium);
}

.option-selector-legend {
  padding: 0 8px;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.option-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
}

.option-selection-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-selection-card:hover {
  border-color: var(--color-action-primary);
}

.option-selection-card:has(input:checked) {
  background: var(--color-background-page);
  border-color: var(--color-action-primary);
  box-shadow: inset 0 0 0 1px var(--color-action-primary);
}

.option-radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.option-card-description {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

</style>