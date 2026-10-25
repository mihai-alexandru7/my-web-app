<script setup lang="ts">

defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

</script>

<template>
  <Teleport to="body">
    <div class="administration-overlay" @click.self="emit('close')">
      <div class="administration-modal" role="dialog" aria-modal="true" :aria-label="title">
        <div class="administration-modal-header">
          <h3>{{ title }}</h3>
          <button class="administration-button administration-button-small" type="button" aria-label="Close" @click="emit('close')">✕</button>
        </div>
        <div class="administration-modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="administration-modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
