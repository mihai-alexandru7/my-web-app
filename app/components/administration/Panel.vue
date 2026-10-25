<script setup lang="ts">

const props = defineProps<{
  id: string
  title: string
  description: string
  expanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

</script>

<template>
  <article
      :id="`section-${id}`"
      class="administration-accordion-panel"
      :class="{ 'is-expanded': expanded }"
  >
    <div class="administration-accordion-header">
      <div class="administration-accordion-title-container">
        <div class="administration-title-row">
          <h2 class="administration-accordion-heading">{{ title }}</h2>
        </div>
        <p class="administration-accordion-description">{{ description }}</p>
      </div>

      <button
          type="button"
          class="administration-arrow-toggle-button"
          :class="{ 'is-active': expanded }"
          :aria-label="expanded ? 'Collapse section' : 'Expand section'"
          :aria-expanded="expanded"
          :aria-controls="`content-${id}`"
          @click="emit('toggle')"
      >
        <span class="administration-arrow-icon" :class="{ 'is-up': expanded }"></span>
      </button>
    </div>

    <div
        v-show="expanded"
        :id="`content-${id}`"
        class="administration-accordion-body"
    >
      <div class="administration-accordion-content-container">
        <slot />
      </div>
    </div>
  </article>
</template>

<style scoped>

.administration-accordion-panel {
  background: var(--administration-surface);
  border: 1.5px solid var(--administration-border);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(45, 35, 10, 0.05);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.administration-accordion-panel.is-expanded {
  border-color: var(--administration-primary);
  box-shadow: 0 14px 34px rgba(84, 66, 14, 0.12);
}

.administration-accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 26px;
  background: var(--administration-surface);
}

.administration-accordion-title-container {
  flex: 1;
  min-width: 0;
}

.administration-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.administration-accordion-heading {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--administration-primary);
}

.administration-accordion-description {
  margin: 0;
  font-size: 0.98rem;
  color: var(--administration-muted);
  line-height: 1.45;
}

.administration-arrow-toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1.5px solid var(--administration-border);
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.administration-arrow-toggle-button:hover {
  background: var(--administration-surface-alternate);
  border-color: var(--administration-primary);
}

.administration-arrow-toggle-button.is-active {
  background: var(--administration-primary);
  border-color: var(--administration-primary);
}

.administration-arrow-icon {
  width: 10px;
  height: 10px;
  border-right: 2.5px solid var(--administration-primary);
  border-bottom: 2.5px solid var(--administration-primary);
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.25s ease, border-color 0.2s ease;
}

.administration-arrow-toggle-button.is-active .administration-arrow-icon {
  border-right-color: var(--administration-primary-text);
  border-bottom-color: var(--administration-primary-text);
}

.administration-arrow-icon.is-up {
  transform: translateY(2px) rotate(-135deg);
}

.administration-accordion-body {
  border-top: 1.5px solid var(--administration-border-subtle);
  background: #ffffff;
}

.administration-accordion-content-container {
  padding: 24px;
}

@media (max-width: 768px) {
  .administration-accordion-header {
    padding: 16px 18px;
  }

  .administration-accordion-content-container {
    padding: 16px 12px;
  }
}

</style>
