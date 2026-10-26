<script setup lang="ts">

defineProps<{
  title: string
  danger?: boolean
  maxWidth?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <div
          class="modal-window"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :style="maxWidth ? { maxWidth } : undefined"
      >
        <header class="modal-header" :class="{ 'modal-header-danger': danger }">
          <h3 class="modal-title">{{ title }}</h3>
          <button type="button" class="modal-close-button" aria-label="Close" @click="emit('close')">✕</button>
        </header>

        <div class="modal-body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--color-background-overlay);
  backdrop-filter: blur(4px);
}

.modal-window {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-modal);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  overflow: hidden;
  animation: modalPop 0.2s ease-out;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1.5px solid var(--color-border-subtle);
  background: var(--color-background-surface-alternate);
}

.modal-title {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 500;
  color: var(--color-action-primary);
}

.modal-header.modal-header-danger .modal-title {
  color: var(--color-status-danger);
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}

.modal-close-button:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1.5px solid var(--color-border-subtle);
  background: var(--color-background-surface-alternate);
}

</style>