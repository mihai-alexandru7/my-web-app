<script setup lang="ts">

defineProps<{
  title: string
  description: string
  danger?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <button
      type="button"
      class="action-tile-button"
      :class="{ 'button-danger': danger }"
      @click="emit('click')"
  >
    <div class="action-tile-content">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
  </button>
</template>
