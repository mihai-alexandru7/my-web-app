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
      class="account-icon-button"
      :class="{ open }"
      type="button"
      :aria-label="open ? 'Close account menu' : 'Open account menu'"
      :aria-expanded="open"
      @click="emit('click')"
  >
    <span class="account-avatar-head"></span>
    <span class="account-avatar-body"></span>
  </button>
</template>

<style scoped>

.account-icon-button {
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1.5px solid #b8aa72;
  border-radius: 14px;
  background: #fffdf5;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(45, 35, 10, 0.1);
  transition: all 0.2s ease;
}

.account-icon-button:hover {
  background: #e8dfb6;
  border-color: #54420e;
}

.account-icon-button.open {
  background: #54420e;
  border-color: #54420e;
}

.account-avatar-head {
  position: absolute;
  top: 13px;
  width: 10px;
  height: 10px;
  border: 2px solid #54420e;
  border-radius: 50%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-avatar-body {
  position: absolute;
  bottom: 12px;
  width: 20px;
  height: 10px;
  border: 2px solid #54420e;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-icon-button.open .account-avatar-head {
  top: 23px;
  width: 22px;
  height: 2.5px;
  border: none;
  border-radius: 2px;
  background-color: #ffffff;
  transform: rotate(45deg);
}

.account-icon-button.open .account-avatar-body {
  bottom: 23px;
  width: 22px;
  height: 2.5px;
  border: none;
  border-radius: 2px;
  background-color: #ffffff;
  transform: rotate(-45deg);
}

</style>