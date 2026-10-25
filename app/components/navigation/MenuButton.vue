<script setup lang="ts">

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

</script>

<template>
  <button
      class="menu-icon-button"
      :class="{ open }"
      type="button"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      :aria-expanded="open"
      @click="emit('click')"
  >
    <span class="line first-line"></span>
    <span class="line second-line"></span>
  </button>
</template>

<style scoped>

.menu-icon-button {
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
  border: 1.5px solid #b8aa72;
  border-radius: 14px;
  background: #fffdf5;
  color: #54420e;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(45, 35, 10, 0.1);
  transition: all 0.2s ease;
}

.menu-icon-button:hover {
  background: #e8dfb6;
  border-color: #54420e;
}

.menu-icon-button.open {
  background: #54420e;
  border-color: #54420e;
}

.menu-icon-button .line {
  width: 22px;
  height: 2.5px;
  border-radius: 2px;
  background-color: #54420e;
  transform-origin: center;
  transition: transform 0.3s ease, background-color 0.2s ease;
}

.menu-icon-button.open .line {
  background-color: #ffffff;
}

.menu-icon-button.open .first-line {
  transform: translateY(4.25px) rotate(45deg);
}

.menu-icon-button.open .second-line {
  transform: translateY(-4.25px) rotate(-45deg);
}

</style>