<script setup lang="ts">

export interface TabOption {
  id: string
  label: string
}

defineProps<{
  options: TabOption[]
}>()

const model = defineModel<string>({ required: true })

</script>

<template>
  <div class="tab-group-container" role="tablist">
    <button
        v-for="option in options"
        :key="option.id"
        class="tab-item-button"
        :class="{ 'is-active': model === option.id }"
        type="button"
        role="tab"
        :aria-selected="model === option.id"
        @click="model = option.id"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>

.tab-group-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.tab-item-button {
  padding: 8px 20px;
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-pill);
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item-button:hover {
  border-color: var(--color-action-primary);
}

.tab-item-button.is-active {
  background: var(--color-action-primary);
  border-color: var(--color-action-primary);
  color: var(--color-action-on-primary);
  font-weight: 600;
}

</style>