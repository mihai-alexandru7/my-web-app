<script setup lang="ts">

defineProps<{
  id: string
  title: string
  description?: string
  expanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

</script>

<template>
  <article
      :id="`section-${id}`"
      class="accordion-panel"
      :class="{ 'is-expanded': expanded }"
  >
    <div class="accordion-header">
      <div class="accordion-title-container">
        <h2 class="accordion-heading">{{ title }}</h2>
        <p v-if="description" class="accordion-description">{{ description }}</p>
      </div>

      <button
          type="button"
          class="accordion-toggle-button"
          :class="{ 'is-active': expanded }"
          :aria-label="expanded ? 'Collapse section' : 'Expand section'"
          :aria-expanded="expanded"
          :aria-controls="`content-${id}`"
          @click="emit('toggle')"
      >
        <span class="accordion-arrow-indicator" :class="{ 'is-up': expanded }"></span>
      </button>
    </div>

    <div
        v-show="expanded"
        :id="`content-${id}`"
        class="accordion-body-container"
    >
      <div class="accordion-inner-content">
        <slot />
      </div>
    </div>
  </article>
</template>

<style scoped>

.accordion-panel {
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-card);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.accordion-panel.is-expanded {
  border-color: var(--color-action-primary);
  box-shadow: 0 14px 34px rgba(84, 66, 14, 0.12);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 26px;
  background: var(--color-background-surface);
}

.accordion-title-container {
  flex: 1;
  min-width: 0;
}

.accordion-heading {
  margin: 0 0 6px 0;
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--color-action-primary);
}

.accordion-description {
  margin: 0;
  font-size: 0.98rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.accordion-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-medium);
  background: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.accordion-toggle-button:hover {
  background: var(--color-background-surface-alternate);
  border-color: var(--color-action-primary);
}

.accordion-toggle-button.is-active {
  background: var(--color-action-primary);
  border-color: var(--color-action-primary);
}

.accordion-arrow-indicator {
  width: 10px;
  height: 10px;
  border-right: 2.5px solid var(--color-action-primary);
  border-bottom: 2.5px solid var(--color-action-primary);
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.25s ease, border-color 0.2s ease;
}

.accordion-toggle-button.is-active .accordion-arrow-indicator {
  border-right-color: var(--color-action-on-primary);
  border-bottom-color: var(--color-action-on-primary);
}

.accordion-arrow-indicator.is-up {
  transform: translateY(2px) rotate(-135deg);
}

.accordion-body-container {
  border-top: 1.5px solid var(--color-border-subtle);
  background: #ffffff;
}

.accordion-inner-content {
  padding: 24px;
}

</style>