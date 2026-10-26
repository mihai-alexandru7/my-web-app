<script setup lang="ts">

defineProps<{
  title: string
  description?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <button
      type="button"
      class="action-tile-item"
      :class="{ 'is-danger': danger }"
      @click="emit('click')"
  >
    <div class="action-tile-text-container">
      <strong class="action-tile-heading">{{ title }}</strong>
      <span v-if="description" class="action-tile-subtext">{{ description }}</span>
    </div>
  </button>
</template>

<style scoped>

.action-tile-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--color-background-surface-card);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s ease;
}

.action-tile-item:hover {
  border-color: var(--color-action-primary);
  background: #ffffff;
  transform: translateY(-1px);
  box-shadow: var(--box-shadow-card);
}

.action-tile-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-tile-heading {
  font-size: 1rem;
  color: var(--color-text-primary);
}

.action-tile-subtext {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.action-tile-item.is-danger {
  border-color: var(--color-status-danger-border);
}

.action-tile-item.is-danger:hover {
  background: var(--color-status-danger-background);
  border-color: var(--color-status-danger);
}

.action-tile-item.is-danger .action-tile-heading {
  color: var(--color-status-danger);
}

</style>