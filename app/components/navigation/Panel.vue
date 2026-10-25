<script setup lang="ts">

defineProps<{
  id: string
  side: 'left' | 'right'
  open: boolean
}>()

</script>

<template>
  <transition :name="side === 'left' ? 'panel-slide-left' : 'panel-slide-right'">
    <div
        v-if="open"
        :id="id"
        class="navigation-panel"
        :class="`navigation-panel-${side}`"
    >
      <div class="navigation-panel-content">
        <slot />
      </div>
    </div>
  </transition>
</template>

<style scoped>

.navigation-panel {
  position: absolute;
  top: -8px;
  width: 20vw;
  min-width: 220px;
  max-width: 320px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: #fffdf5;
  border: 1.5px solid #b8aa72;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(45, 35, 10, 0.18);
  z-index: 1000;
}

.navigation-panel-left {
  left: -8px;
}

.navigation-panel-right {
  right: -8px;
}

.navigation-panel-content {
  padding: 72px 18px 24px;
}

.panel-slide-left-enter-active,
.panel-slide-left-leave-active,
.panel-slide-right-enter-active,
.panel-slide-right-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.panel-slide-left-enter-from,
.panel-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.panel-slide-right-enter-from,
.panel-slide-right-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

@media (max-width: 900px) {
  .navigation-panel {
    width: 280px;
    max-width: calc(100vw - 32px);
  }
}

</style>
