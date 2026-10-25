<script setup lang="ts">
export interface RoleOption {
  value: string
  title: string
  description: string
}

const props = withDefaults(
    defineProps<{
      options?: RoleOption[]
      disabled?: boolean
    }>(),
    {
      options: () => [
        { value: 'reader', title: 'Reader', description: 'Browse, buy and read books online.' },
        { value: 'publisher', title: 'Publisher', description: 'Upload and sell your books.' },
      ],
      disabled: false,
    },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <fieldset class="role-group" :disabled="disabled">
    <legend class="role-legend">Account type</legend>
    <div class="role-options">
      <label v-for="option in props.options" :key="option.value" class="role-option">
        <input v-model="model" type="radio" name="role" :value="option.value" />
        <span class="role-title">{{ option.title }}</span>
        <span class="role-desc">{{ option.description }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.role-group {
  min-width: 0;
  margin: 0;
  padding: 14px 16px 16px;
  border: 1px solid var(--account-group-border);
  border-radius: 12px;
}

.role-legend {
  padding: 0 8px;
  font-size: 0.95rem;
  color: var(--account-muted);
}

.role-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
}

.role-option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  background: var(--account-field);
  border: 1px solid var(--account-field-border);
  border-radius: 8px;
  cursor: pointer;
}

.role-option:hover {
  border-color: var(--account-accent);
}

.role-option:has(input:checked) {
  background: var(--account-page);
  border-color: var(--account-accent);
  box-shadow: inset 0 0 0 1px var(--account-accent);
}

.role-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.role-title {
  font-size: 1.1rem;
}

.role-desc {
  font-size: 0.9rem;
  color: var(--account-muted);
}

.role-option:has(input:focus-visible) {
  outline: 2px solid var(--account-accent);
  outline-offset: 2px;
}
</style>