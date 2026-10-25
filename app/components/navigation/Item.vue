<script setup lang="ts">

defineProps<{
  to?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <NuxtLink
      v-if="to"
      :to="to"
      class="navigation-item-button"
      :class="{ 'is-danger': danger }"
  >
    <span><slot /></span>
  </NuxtLink>
  <button
      v-else
      type="button"
      class="navigation-item-button"
      :class="{ 'is-danger': danger }"
      @click="emit('click')"
  >
    <span><slot /></span>
  </button>
</template>

<style scoped>

.navigation-item-button {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  padding: 12px 16px;
  background: #f4edd0;
  border: 1.5px solid #cfc495;
  border-radius: 12px;
  color: #141f28;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.navigation-item-button:hover {
  background: #e8dfb6;
  border-color: #54420e;
}

.navigation-item-button.router-link-exact-active {
  background: #54420e;
  border-color: #54420e;
  color: #ffffff;
  font-weight: 600;
}

.navigation-item-button.is-danger {
  color: #9c1c15;
  border-color: #d48b87;
  background: #ffffff;
}

.navigation-item-button.is-danger:hover {
  background: #ffebeb;
  border-color: #9c1c15;
}

</style>