<script setup lang="ts">

import '@/assets/css/account.css'

export interface CardProps {
  title: string
  showCancel?: boolean
  cancelLabel?: string
  inline?: boolean
}

withDefaults(defineProps<CardProps>(), {
  showCancel: true,
  cancelLabel: 'Cancel',
  inline: false
})

const emit = defineEmits<{ cancel: [] }>()

</script>

<template>
  <section v-if="inline" class="account-card inline-card" :aria-labelledby="title">
    <header class="account-card-header">
      <h2>{{ title }}</h2>
    </header>
    <div class="account-card-content">
      <slot />
    </div>
    <footer v-if="showCancel || $slots.footer" class="account-card-footer">
      <slot name="footer">
        <button v-if="showCancel" type="button" class="account-button-outline" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
      </slot>
    </footer>
  </section>
  <main v-else class="account-page">
    <section class="account-card" :aria-labelledby="title">
      <header class="account-card-header">
        <h1>{{ title }}</h1>
      </header>
      <div class="account-card-content">
        <slot />
      </div>
      <footer v-if="showCancel || $slots.footer" class="account-card-footer">
        <slot name="footer">
          <button v-if="showCancel" type="button" class="account-button-outline" @click="emit('cancel')">
            {{ cancelLabel }}
          </button>
        </slot>
      </footer>
    </section>
  </main>
</template>

<style scoped>

.account-page {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  display: grid;
  padding: 24px 16px;
  background: var(--account-page);
  color: var(--account-ink);
  font-family: var(--account-font);
  font-size: 1rem;
  line-height: 1.5;
}

.account-card {
  box-sizing: border-box;
  width: 40%;
  min-width: min(420px, 100%);
  margin: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--account-card);
  border: 1px solid var(--account-card-border);
  border-radius: 20px;
}

.account-card.inline-card {
  width: 100%;
  min-width: 0;
  margin: 16px 0;
  padding: 28px;
  background: var(--account-field);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.account-card-header h1,
.account-card-header h2 {
  margin: 0 0 4px;
  font-size: 1.7rem;
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
  color: var(--account-accent);
}

.account-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card-footer {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

@media (max-width: 760px) {
  .account-card {
    width: 100%;
    min-width: 0;
    padding: 20px;
  }
}

</style>
