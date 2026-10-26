<script setup lang="ts">

defineProps<{
  open: boolean
  variant: 'menu' | 'account'
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <button
      class="navigation-trigger-button"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open"
      @click="emit('click')"
  >
    <template v-if="variant === 'menu'">
      <span class="trigger-bar-line first-line"></span>
      <span class="trigger-bar-line second-line"></span>
    </template>
    <template v-else-if="variant === 'account'">
      <span class="account-avatar-head-shape"></span>
      <span class="account-avatar-body-shape"></span>
    </template>
  </button>
</template>

<style scoped>

.navigation-trigger-button {
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-medium);
  background: var(--color-background-surface);
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(45, 35, 10, 0.1);
  transition: all 0.2s ease;
}

.navigation-trigger-button:hover {
  background: var(--color-background-surface-alternate);
  border-color: var(--color-action-primary);
}

.navigation-trigger-button.is-open {
  background: var(--color-action-primary);
  border-color: var(--color-action-primary);
}

.trigger-bar-line {
  width: 22px;
  height: 2.5px;
  border-radius: 2px;
  background-color: var(--color-action-primary);
  transform-origin: center;
  transition: transform 0.3s ease, background-color 0.2s ease;
}

.navigation-trigger-button.is-open .trigger-bar-line {
  background-color: #ffffff;
}

.navigation-trigger-button.is-open .first-line {
  transform: translateY(4.25px) rotate(45deg);
}

.navigation-trigger-button.is-open .second-line {
  transform: translateY(-4.25px) rotate(-45deg);
}

.account-avatar-head-shape {
  position: absolute;
  top: 13px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--color-action-primary);
  border-radius: 50%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.account-avatar-body-shape {
  position: absolute;
  bottom: 12px;
  width: 20px;
  height: 10px;
  border: 2px solid var(--color-action-primary);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.navigation-trigger-button.is-open .account-avatar-head-shape {
  top: 23px;
  width: 22px;
  height: 2.5px;
  border: none;
  border-radius: 2px;
  background-color: #ffffff;
  transform: rotate(45deg);
}

.navigation-trigger-button.is-open .account-avatar-body-shape {
  bottom: 23px;
  width: 22px;
  height: 2.5px;
  border: none;
  border-radius: 2px;
  background-color: #ffffff;
  transform: rotate(-45deg);
}

</style>