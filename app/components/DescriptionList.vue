<script setup lang="ts">

export interface DescriptionItem {
  label: string
  value?: string | number | null
  multiline?: boolean
}

defineProps<{
  items?: DescriptionItem[]
}>()

</script>

<template>
  <dl class="description-list-grid">
    <template v-if="items">
      <template v-for="item in items" :key="item.label">
        <dt class="description-label">{{ item.label }}</dt>
        <dd class="description-content" :class="{ 'multiline-content': item.multiline }">
          {{ item.value || '—' }}
        </dd>
      </template>
    </template>
    <slot />
  </dl>
</template>

<style scoped>

.description-list-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px 18px;
  margin: 0;
}

:deep(dt),
.description-label {
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.92rem;
  text-transform: uppercase;
}

:deep(dd),
.description-content {
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 500;
}

.multiline-content,
:deep(.multiline-content) {
  white-space: pre-wrap;
}

</style>