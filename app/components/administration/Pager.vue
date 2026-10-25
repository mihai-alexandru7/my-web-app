<script setup lang="ts">

const props = defineProps<{ total: number; pageSize: number }>()
const page = defineModel<number>('page', { required: true })

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

</script>

<template>
  <div v-if="total > 0" class="administration-pager">
    <span class="administration-muted">{{ total }} result{{ total === 1 ? '' : 's' }}</span>
    <div class="administration-pager-controls">
      <button class="administration-button administration-button-small" type="button" :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} of {{ pages }}</span>
      <button class="administration-button administration-button-small" type="button" :disabled="page >= pages" @click="page++">Next</button>
    </div>
  </div>
</template>
