<script setup lang="ts">

defineProps<{
  label: string
  items: { id: number; name: string }[]
  required?: boolean
}>()

const model = defineModel<number[]>({ required: true })

</script>

<template>
  <div class="checkbox-group-wrapper">
    <label class="checkbox-group-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    <div class="checkbox-options-container">
      <label v-for="item in items" :key="item.id" class="checkbox-item-label">
        <input v-model="model" type="checkbox" :value="item.id" />
        <span>{{ item.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>

.checkbox-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkbox-group-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required-indicator {
  color: var(--color-status-danger);
}

.checkbox-options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  max-height: 120px;
  overflow-y: auto;
  padding: 10px 12px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
}

.checkbox-item-label {
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

</style>