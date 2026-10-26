<script setup lang="ts">

defineProps<{
  title: string
  subtitle?: string
}>()

</script>

<template>
  <main class="page-layout-wrapper">
    <div class="page-main-container">
      <header class="page-header-container">
        <div class="page-title-group">
          <h1 class="page-heading-title">{{ title }}</h1>
          <p v-if="subtitle" class="page-heading-subtitle">{{ subtitle }}</p>
        </div>

        <div v-if="$slots.actions" class="page-actions-group">
          <slot name="actions" />
        </div>
      </header>

      <div class="page-content-wrapper">
        <slot />
      </div>
    </div>
  </main>
</template>

<style scoped>

.page-layout-wrapper {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.page-main-container {
  width: 80%;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-extra-large);
  padding: 36px;
  box-shadow: var(--box-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

.page-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--color-border-main);
}

.page-title-group {
  flex: 1;
  min-width: 240px;
}

.page-heading-title {
  margin: 0 0 6px 0;
  font-size: 2.2rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.page-heading-subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-text-muted);
}

.page-actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 900px) {
  .page-main-container {
    width: 95%;
    padding: 20px 16px;
  }
}

</style>