<script setup lang="ts">

const props = defineProps<{
  status: string
}>()

const statusClass = computed(() => {
  const normalized = props.status.toLowerCase()
  if (normalized === 'approved' || normalized === 'active') return 'status-badge-success'
  if (normalized === 'rejected' || normalized === 'withdrawn' || normalized === 'inactive') return 'status-badge-danger'
  if (normalized === 'pending' || normalized === 'publisher') return 'status-badge-warning'
  return 'status-badge-neutral'
})

</script>

<template>
  <span class="status-badge" :class="statusClass">
    {{ status }}
  </span>
</template>

<style scoped>

.status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: var(--border-radius-small);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: capitalize;
  border: 1.5px solid currentColor;
}

.status-badge-success {
  color: var(--color-status-success);
  background: var(--color-status-success-background);
}

.status-badge-warning {
  color: var(--color-status-warning);
  background: var(--color-status-warning-background);
}

.status-badge-danger {
  color: var(--color-status-danger);
  background: var(--color-status-danger-background);
}

.status-badge-neutral {
  color: var(--color-action-primary);
  background: var(--color-background-field);
}

</style>