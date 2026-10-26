<script setup lang="ts">

defineProps<{
  title: string
  id?: string
}>()

</script>

<template>
  <section :id="id" class="section-card">
    <header class="section-card-header">
      <h2 class="section-card-title">{{ title }}</h2>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>

<style scoped>

.section-card {
  background: var(--color-background-surface-section);
  border: 1px solid var(--color-border-group);
  border-radius: var(--border-radius-large);
  padding: 28px;
  box-shadow: var(--box-shadow-card);
  scroll-margin-top: 100px;
}

.section-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--color-action-primary);
  margin-bottom: 22px;
}

.section-card-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--color-action-primary);
}

</style>