<script setup lang="ts">

defineProps<{
  displayName?: string
  email: string
}>()

</script>

<template>
  <div class="user-info-container">
    <span v-if="displayName" class="user-info-name">{{ displayName }}</span>
    <span class="user-info-email">{{ email }}</span>
  </div>
</template>

<style scoped>

.user-info-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
  padding: 10px 14px;
  background: #e8dfb6;
  border: 1px solid #cfc495;
  border-radius: 12px;
  color: #141f28;
  font-size: 0.9rem;
  text-align: center;
  word-break: break-all;
}

.user-info-name {
  font-weight: 700;
  font-size: 1rem;
  color: #54420e;
}

</style>