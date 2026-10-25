<script setup lang="ts">
const props = defineProps<{
  password: string
}>()

const rules = computed(() => [
  { label: 'At least 8 characters', met: props.password.length >= 8 },
  { label: 'A letter', met: /[A-Za-z]/.test(props.password) },
  { label: 'A digit', met: /\d/.test(props.password) },
  { label: 'A special character', met: /[^A-Za-z0-9]/.test(props.password) },
])

const isValid = computed(() => rules.value.every((r) => r.met) && props.password.length <= 128)

defineExpose({ isValid, rules })
</script>

<template>
  <ul class="rules" aria-label="Password requirements">
    <li v-for="rule in rules" :key="rule.label" :class="{ met: rule.met }">
      <span aria-hidden="true">{{ rule.met ? '✓' : '•' }}</span>
      {{ rule.label }}
    </li>
  </ul>
</template>

<style scoped>
.rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
  color: var(--account-muted);
}

.rules li.met {
  color: var(--account-ok);
}
</style>