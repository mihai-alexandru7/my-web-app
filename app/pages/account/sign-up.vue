<script setup lang="ts">

import { getFieldErrors, getErrorMessage } from '@/utils/errors'

definePageMeta({ layout: false })
useSeoMeta({ title: 'Sign up' })

type Role = 'reader' | 'publisher'

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
const emailConfirmed = ref(false)
const role = ref<Role>('reader')
const firstName = ref('')
const lastName = ref('')
const password = ref('')
const publisherName = ref('')
const publisherDescription = ref('')
const submitting = ref(false)
const generalError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const emailField = ref<{ focus: () => void } | null>(null)
const firstNameField = ref<{ focus: () => void } | null>(null)
const publisherNameField = ref<{ focus: () => void } | null>(null)
const passwordRulesRef = ref<{ isValid: boolean } | null>(null)

onMounted(() => {
  emailField.value?.focus()
})

const emailIsValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const passwordIsValid = computed(() => Boolean(passwordRulesRef.value?.isValid))

const canCreate = computed(() => {
  if (!passwordIsValid.value) return false
  if (role.value === 'reader') {
    return firstName.value.trim().length > 0 && lastName.value.trim().length > 0
  }
  return publisherName.value.trim().length >= 2
})

watch(email, () => { delete fieldErrors.value.email })
watch(firstName, () => { delete fieldErrors.value.firstName })
watch(lastName, () => { delete fieldErrors.value.lastName })
watch(publisherName, () => { delete fieldErrors.value.publisherName })
watch(password, () => { delete fieldErrors.value.password })
watch(role, async (newRole) => {
  delete fieldErrors.value.firstName
  delete fieldErrors.value.lastName
  delete fieldErrors.value.publisherName
  delete fieldErrors.value.publisherDescription
  await nextTick()
  if (newRole === 'reader') {
    firstNameField.value?.focus()
  } else {
    publisherNameField.value?.focus()
  }
})

async function continueToDetails() {
  if (emailConfirmed.value) return
  if (!emailIsValid.value) {
    fieldErrors.value.email = 'Please enter a valid email address.'
    return
  }
  generalError.value = ''
  delete fieldErrors.value.email
  emailConfirmed.value = true
  await nextTick()
  if (role.value === 'reader') {
    firstNameField.value?.focus()
  } else {
    publisherNameField.value?.focus()
  }
}

async function changeEmail() {
  emailConfirmed.value = false
  generalError.value = ''
  await nextTick()
  emailField.value?.focus()
}

async function createAccount() {
  if (!canCreate.value || submitting.value) return
  submitting.value = true
  generalError.value = ''
  fieldErrors.value = {}

  try {
    const payload = role.value === 'reader'
        ? {
          role: 'reader' as const,
          email: email.value.trim(),
          password: password.value,
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
        }
        : {
          role: 'publisher' as const,
          email: email.value.trim(),
          password: password.value,
          publisherName: publisherName.value.trim(),
          publisherDescription: publisherDescription.value.trim() || undefined,
        }

    await $fetch('/api/account/sign-up', {
      method: 'POST',
      body: payload,
    })
    await refreshSession()
    await navigateTo(redirectPath.value)
  } catch (error) {
    const fields = getFieldErrors(error)
    const errorMessage = getErrorMessage(error)

    if (Object.keys(fields).length > 0) {
      fieldErrors.value = fields
      if (fields.email && emailConfirmed.value) {
        emailConfirmed.value = false
      }
    } else {
      if (errorMessage.toLowerCase().includes('email')) {
        emailConfirmed.value = false
        fieldErrors.value.email = errorMessage
      } else if (errorMessage.toLowerCase().includes('publisher')) {
        fieldErrors.value.publisherName = errorMessage
      } else {
        generalError.value = errorMessage
      }
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
  <AccountCard title="Create your account" @cancel="cancel">
    <AccountForm
        submit-label="Continue"
        :can-submit="emailIsValid"
        :hide-submit="emailConfirmed"
        @submit="continueToDetails"
    >
      <AccountFormField
          ref="emailField"
          v-model="email"
          label="Email address"
          name="email"
          type="email"
          autocomplete="email"
          inputmode="email"
          placeholder="Email address"
          :readonly="emailConfirmed"
          :error="fieldErrors.email"
          :action-label="emailConfirmed ? 'Change' : undefined"
          @action="changeEmail"
      />
    </AccountForm>

    <Transition name="reveal">
      <AccountForm
          v-if="emailConfirmed"
          submit-label="Create account"
          pending-label="Creating account…"
          :submitting="submitting"
          :can-submit="canCreate"
          :error="generalError"
          @submit="createAccount"
      >
        <AccountRoleSelector v-model="role" :disabled="submitting" />

        <div v-if="role === 'reader'" class="field-pair">
          <AccountFormField
              ref="firstNameField"
              v-model="firstName"
              label="First name"
              name="firstName"
              autocomplete="given-name"
              placeholder="First name"
              :maxlength="100"
              :error="fieldErrors.firstName"
          />
          <AccountFormField
              v-model="lastName"
              label="Last name"
              name="lastName"
              autocomplete="family-name"
              placeholder="Last name"
              :maxlength="100"
              :error="fieldErrors.lastName"
          />
        </div>

        <template v-else>
          <AccountFormField
              ref="publisherNameField"
              v-model="publisherName"
              label="Publisher name"
              name="publisherName"
              autocomplete="organization"
              placeholder="Publisher name"
              :maxlength="200"
              :error="fieldErrors.publisherName"
          />
          <AccountFormField
              v-model="publisherDescription"
              label="Description (optional)"
              name="publisherDescription"
              placeholder="Description (optional)"
              multiline
              :rows="3"
              :maxlength="2000"
              :error="fieldErrors.publisherDescription"
          />
        </template>

        <AccountFormField
            v-model="password"
            label="Password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="Password"
            :maxlength="128"
            :error="fieldErrors.password"
        >
          <template #hint>
            <AccountPasswordRules ref="passwordRulesRef" :password="password" />
          </template>
        </AccountFormField>
      </AccountForm>
    </Transition>

    <p class="switch">
      Already have an account?
      <NuxtLink class="link" :to="{ path: '/account/sign-in', query: route.query }">Sign in</NuxtLink>
    </p>
  </AccountCard>
</template>

<style scoped>

.field-pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
}

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

.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

</style>