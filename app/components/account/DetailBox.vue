<script setup lang="ts">

defineProps<{
  label: string
  value?: string | null
}>()

</script>

<template>
  <div class="detail-box">
    <span class="detail-label">{{ label }}</span>
    <slot>
      <span class="detail-value">{{ value || '—' }}</span>
    </slot>
  </div>
</template>
