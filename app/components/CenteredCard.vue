<script setup lang="ts">

defineProps<{
  title: string
  showCancel?: boolean
  cancelLabel?: string
}>()

const emit = defineEmits<{ cancel: [] }>()

</script>

<template>
  <main class="centered-card-backdrop">
    <section class="centered-card-wrapper" :aria-labelledby="title">
      <header class="centered-card-header">
        <h1 class="centered-card-title">{{ title }}</h1>
      </header>

      <div class="centered-card-content">
        <slot />
      </div>

      <footer v-if="showCancel || $slots.footer" class="centered-card-footer">
        <slot name="footer">
          <Button v-if="showCancel" variant="outline" @click="emit('cancel')">
            {{ cancelLabel || 'Cancel' }}
          </Button>
        </slot>
      </footer>
    </section>
  </main>
</template>

<style scoped>

.centered-card-backdrop {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  display: grid;
  padding: 24px 16px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
}

.centered-card-wrapper {
  box-sizing: border-box;
  width: 40%;
  min-width: min(420px, 100%);
  margin: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--color-background-surface-card);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-elevated);
}

.centered-card-header h1 {
  margin: 0 0 4px 0;
  font-size: 1.8rem;
  font-weight: 400;
  text-align: center;
  color: var(--color-action-primary);
}

.centered-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.centered-card-footer {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 760px) {
  .centered-card-wrapper {
    width: 100%;
    min-width: 0;
    padding: 20px;
  }
}

</style>