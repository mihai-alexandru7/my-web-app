<script setup lang="ts">

const props = defineProps<{ total: number; pageSize: number }>()
const page = defineModel<number>('page', { required: true })

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

</script>

<template>
  <div v-if="total > 0" class="pagination-container">
    <span class="pagination-summary">{{ total }} result{{ total === 1 ? '' : 's' }}</span>
    <div class="pagination-controls">
      <Button variant="outline" size="small" :disabled="page <= 1" @click="page--">
        Previous
      </Button>
      <span class="pagination-current-page">Page {{ page }} of {{ totalPages }}</span>
      <Button variant="outline" size="small" :disabled="page >= totalPages" @click="page++">
        Next
      </Button>
    </div>
  </div>
</template>

<style scoped>

.pagination-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.pagination-summary {
  color: var(--color-text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.pagination-current-page {
  font-size: 0.95rem;
}

</style>