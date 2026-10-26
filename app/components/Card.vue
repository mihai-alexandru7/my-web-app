<script setup lang="ts">

export interface CardProps {
  title?: string
  subtitle?: string
}

defineProps<CardProps>()

</script>

<template>
  <section class="card-container">
    <header v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h2 class="card-title">{{ title }}</h2>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>

.card-container {
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-large);
  padding: 24px;
  box-shadow: var(--box-shadow-card);
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--color-border-subtle);
  margin-bottom: 20px;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-footer {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1.5px solid var(--color-border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

</style>