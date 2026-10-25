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
const emailField = ref<{ focus: () => void } | null>(null)

const emailIsValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const canSignIn = computed(() => emailIsValid.value && password.value.length > 0)

watch(email, () => { if (fieldErrors.value.email) fieldErrors.value.email = '' })
watch(password, () => { if (fieldErrors.value.password) fieldErrors.value.password = '' })

onMounted(() => {
  emailField.value?.focus()
})

async function signIn() {
  if (!canSignIn.value || submitting.value) return
  submitting.value = true
  generalError.value = ''
  fieldErrors.value = {}

  try {
    await $fetch('/api/account/sign-in', {
      method: 'POST',
      body: { email: email.value.trim(), password: password.value },
    })
    await refreshSession()
    await navigateTo(redirectPath.value)
  } catch (error) {
    const fields = getFieldErrors(error)
    if (Object.keys(fields).length > 0) {
      fieldErrors.value = fields
    } else {
      generalError.value = getErrorMessage(error)
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
  <AccountCard title="Sign in to your account" @cancel="cancel">
    <AccountForm
        submit-label="Sign In"
        pending-label="Signing in…"
        :submitting="submitting"
        :can-submit="canSignIn"
        :error="generalError"
        @submit="signIn"
    >
      <AccountFormField
          ref="emailField"
          v-model="email"
          label="Email"
          name="email"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="Email"
          :error="fieldErrors.email"
      />
      <AccountFormField
          v-model="password"
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="Password"
          :maxlength="128"
          :error="fieldErrors.password"
      />
    </AccountForm>
    <p class="switch">
      Don't have an account?
      <NuxtLink class="link" :to="{ path: '/account/sign-up', query: route.query }">Sign Up</NuxtLink>
    </p>
  </AccountCard>
</template>

<style scoped>

.switch {
  margin: 0;
  text-align: center;
  color: var(--account-muted);
}

.link {
  color: var(--account-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

</style>
