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

const isValid = computed(() => rules.value.every((rule) => rule.met) && props.password.length <= 128)

defineExpose({ isValid, rules })

</script>

<template>
  <ul class="password-rules-list" aria-label="Password requirements">
    <li v-for="rule in rules" :key="rule.label" class="password-rule-item" :class="{ 'is-met': rule.met }">
      <span aria-hidden="true">{{ rule.met ? '✓' : '•' }}</span>
      {{ rule.label }}
    </li>
  </ul>
</template>

<style scoped>

.password-rules-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.password-rule-item.is-met {
  color: var(--color-status-success);
}

</style>