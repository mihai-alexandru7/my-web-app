<script setup lang="ts">

defineProps<{
  title: string
  danger?: boolean
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
      <div class="modal-window" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-header" :class="{ 'header-danger': danger }">
          <h3>{{ title }}</h3>
          <button type="button" class="modal-close-button" aria-label="Close" @click="emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
