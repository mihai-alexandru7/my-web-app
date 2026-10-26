<script setup lang="ts">

import { getFieldErrors, getErrorMessage } from '@/utils/errors'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Sign in' })

const { fetch: refreshSession } = useUserSession()
const route = useRoute()

const redirectPath = computed(() => {
  const target = route.query.redirect
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target
  }
  return '/'
})

const email = ref('')
const password = ref('')
const submitting = ref(false)
const generalError = ref('')
const fieldErrors = ref<{ email?: string; password?: string }>({})

const emailIsValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const canSignIn = computed(() => emailIsValid.value && password.value.length > 0)

watch(email, () => { if (fieldErrors.value.email) fieldErrors.value.email = '' })
watch(password, () => { if (fieldErrors.value.password) fieldErrors.value.password = '' })

async function signIn() {
  if (!canSignIn.value || submitting.value) return
  submitting.value = true
  generalError.value = ''
  fieldErrors.value = {}

  try {
    await $fetch('/api/account/sign-in', {
      method: 'POST',
      body: { email: email.value.trim(), password: password.value }
    })
    await refreshSession()
    await navigateTo(redirectPath.value)
  } catch (caughtError) {
    const fields = getFieldErrors(caughtError)
    if (Object.keys(fields).length > 0) {
      fieldErrors.value = fields
    } else {
      generalError.value = getErrorMessage(caughtError)
    }
  } finally {
    submitting.value = false
  }
}

function cancel() {
  navigateTo(redirectPath.value)
}

</script>

<template>
  <CenteredCard title="Sign in to your account" @cancel="cancel">
    <form class="authentication-form-container" novalidate @submit.prevent="signIn">
      <FormField
          v-model="email"
          label="Email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="Email"
          :show-label="false"
          :error="fieldErrors.email"
      />
      <FormField
          v-model="password"
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="Password"
          :maxlength="128"
          :show-label="false"
          :error="fieldErrors.password"
      />

      <p v-if="generalError" class="authentication-error-message" role="alert">{{ generalError }}</p>

      <Button type="submit" :disabled="!canSignIn || submitting">
        {{ submitting ? 'Signing in…' : 'Sign In' }}
      </Button>
    </form>

    <p class="navigation-switch-mode-text">
      Don't have an account?
      <NuxtLink class="navigation-switch-mode-link" :to="{ path: '/account/sign-up', query: route.query }">Sign Up</NuxtLink>
    </p>
  </CenteredCard>
</template>

<style scoped>

.authentication-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.authentication-error-message {
  margin: 0;
  color: var(--color-status-danger);
  font-size: 0.9rem;
}

.navigation-switch-mode-text {
  margin: 0;
  text-align: center;
  color: var(--color-text-muted);
}

.navigation-switch-mode-link {
  color: var(--color-action-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

</style>