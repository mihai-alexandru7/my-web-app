<script setup lang="ts">

const from = defineModel<string>('from', { required: true })
const to = defineModel<string>('to', { required: true })

function clear() {
  from.value = ''
  to.value = ''
}

</script>

<template>
  <div class="date-filter-row">
    <label class="date-filter-group">
      <span class="date-filter-label">From date</span>
      <input v-model="from" type="date" class="date-filter-input" />
    </label>
    <label class="date-filter-group">
      <span class="date-filter-label">To date</span>
      <input v-model="to" type="date" class="date-filter-input" />
    </label>
    <Button variant="outline" @click="clear">Clear filter</Button>
  </div>
</template>

<style scoped>

.date-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 22px;
}

.date-filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-filter-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.date-filter-input {
  box-sizing: border-box;
  padding: 8px 12px;
  font: inherit;
  color: var(--color-text-primary);
  background: #ffffff;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  width: 175px;
}

</style>