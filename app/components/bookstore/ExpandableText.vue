<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      text?: string
      collapsedHeight?: number
    }>(),
    {
      text: '',
      collapsedHeight: 160,
    },
)

const expanded = ref(false)

const paragraphs = computed(() =>
    props.text.split('\n').filter((p) => p.trim() !== ''),
)
</script>

<template>
  <div class="expandable-wrapper">
    <div
        class="expandable-content"
        :class="{ expanded }"
        :style="{ maxHeight: expanded ? '2000px' : `${collapsedHeight}px` }"
    >
      <slot :paragraphs="paragraphs">
        <p v-for="(p, index) in paragraphs" :key="index">{{ p }}</p>
      </slot>

      <div v-if="!expanded && paragraphs.length > 1" class="fade-overlay">
        <button type="button" class="read-more-button" @click="expanded = true">
          Read more
        </button>
      </div>
    </div>

    <button
        v-if="expanded && paragraphs.length > 1"
        type="button"
        class="read-less-button"
        @click="expanded = false"
    >
      Read less
    </button>
  </div>
</template>

<style scoped>
.expandable-wrapper {
  position: relative;
}

.expandable-content {
  position: relative;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
}

.expandable-content p {
  color: #444;
  line-height: 1.7;
  margin-bottom: 15px;
  text-align: justify;
}

.fade-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
}

.read-more-button {
  background-color: #f6e2b9;
  color: #2c3e50;
  border: none;
  padding: 8px 22px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(246, 226, 185, 0.4);
  transition: background-color 0.2s, transform 0.2s;
}

.read-more-button:hover {
  background-color: #e6cd9d;
  transform: translateY(-1px);
}

.read-less-button {
  background: none;
  border: none;
  color: #8c7853;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0;
  margin-top: 15px;
}

.read-less-button:hover {
  text-decoration: underline;
}
</style>