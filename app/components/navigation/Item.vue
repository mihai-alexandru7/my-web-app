<script setup lang="ts">

defineProps<{
  to?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <NuxtLink
      v-if="to"
      :to="to"
      class="navigation-item-button"
      :class="{ 'is-danger': danger }"
  >
    <span><slot /></span>
  </NuxtLink>
  <button
      v-else
      type="button"
      class="navigation-item-button"
      :class="{ 'is-danger': danger }"
      @click="emit('click')"
  >
    <span><slot /></span>
  </button>
</template>

<style scoped>

.navigation-item-button {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: var(--color-background-surface-card);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--border-radius-medium);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.navigation-item-button:hover {
  background: var(--color-background-surface-alternate);
  border-color: var(--color-action-primary);
}

.navigation-item-button.router-link-exact-active {
  background: var(--color-action-primary);
  border-color: var(--color-action-primary);
  color: var(--color-action-on-primary);
  font-weight: 600;
}

.navigation-item-button.is-danger {
  color: var(--color-status-danger);
  border-color: var(--color-status-danger-border);
  background: var(--color-background-field);
}

.navigation-item-button.is-danger:hover {
  background: var(--color-status-danger-background);
  border-color: var(--color-status-danger);
}

</style>