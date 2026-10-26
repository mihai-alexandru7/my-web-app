<script setup lang="ts">

defineProps<{
  label: string
  accept: string
  required?: boolean
  hint?: string
}>()

const emit = defineEmits<{
  select: [file: File | null]
}>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  emit('select', file)
}

</script>

<template>
  <div class="file-input-wrapper">
    <label class="file-input-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
      <span v-if="hint" class="file-input-hint">({{ hint }})</span>
    </label>
    <input type="file" class="file-input-control" :accept="accept" :required="required" @change="onChange" />
  </div>
</template>

<style scoped>

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-input-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.file-input-hint {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.required-indicator {
  color: var(--color-status-danger);
}

.file-input-control {
  padding: 8px;
  background: var(--color-background-field);
  border: 1.5px dashed var(--color-border-field);
  border-radius: var(--border-radius-small);
  font: inherit;
  font-size: 0.9rem;
}

</style>