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

const roleOptions = [
  { value: 'reader', title: 'Reader', description: 'Browse, buy and read books online.' },
  { value: 'publisher', title: 'Publisher', description: 'Upload and sell your books.' },
]

const passwordRulesRef = ref<{ isValid: boolean } | null>(null)

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
watch(role, () => {
  delete fieldErrors.value.firstName
  delete fieldErrors.value.lastName
  delete fieldErrors.value.publisherName
  delete fieldErrors.value.publisherDescription
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
}

async function changeEmail() {
  emailConfirmed.value = false
  generalError.value = ''
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
  } catch (caughtError) {
    const fields = getFieldErrors(caughtError)
    const errorMessage = getErrorMessage(caughtError)

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
  <CenteredCard title="Create your account" @cancel="cancel">
    <form v-if="!emailConfirmed" class="authentication-form-container" @submit.prevent="continueToDetails">
      <FormField
          v-model="email"
          label="Email address"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="Email address"
          :show-label="false"
          :error="fieldErrors.email"
      />
      <Button type="submit" :disabled="!emailIsValid">Continue</Button>
    </form>

    <div v-else class="authentication-form-container">
      <FormField
          v-model="email"
          label="Email address"
          name="email"
          type="email"
          autocomplete="email"
          :show-label="false"
          :readonly="true"
          action-label="Change"
          @action="changeEmail"
      />

      <form class="authentication-form-container" @submit.prevent="createAccount">
        <OptionSelector
            v-model="role"
            label="Account type"
            :options="roleOptions"
            :disabled="submitting"
        />

        <div v-if="role === 'reader'" class="form-fields-grid-pair">
          <FormField
              v-model="firstName"
              label="First name"
              name="firstName"
              autocomplete="given-name"
              placeholder="First name"
              :show-label="false"
              :maxlength="100"
              :error="fieldErrors.firstName"
          />
          <FormField
              v-model="lastName"
              label="Last name"
              name="lastName"
              autocomplete="family-name"
              placeholder="Last name"
              :show-label="false"
              :maxlength="100"
              :error="fieldErrors.lastName"
          />
        </div>

        <template v-else>
          <FormField
              v-model="publisherName"
              label="Publisher name"
              name="publisherName"
              autocomplete="organization"
              placeholder="Publisher name"
              :show-label="false"
              :maxlength="200"
              :error="fieldErrors.publisherName"
          />
          <FormField
              v-model="publisherDescription"
              label="Description (optional)"
              name="publisherDescription"
              placeholder="Description (optional)"
              multiline
              :show-label="false"
              :rows="3"
              :maxlength="2000"
              :error="fieldErrors.publisherDescription"
          />
        </template>

        <FormField
            v-model="password"
            label="Password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="Password"
            :show-label="false"
            :maxlength="128"
            :error="fieldErrors.password"
        >
          <template #hint>
            <AccountPasswordRules ref="passwordRulesRef" :password="password" />
          </template>
        </FormField>

        <p v-if="generalError" class="authentication-error-message" role="alert">{{ generalError }}</p>

        <Button type="submit" :disabled="!canCreate || submitting">
          {{ submitting ? 'Creating account…' : 'Create account' }}
        </Button>
      </form>
    </div>

    <p class="navigation-switch-mode-text">
      Already have an account?
      <NuxtLink class="navigation-switch-mode-link" :to="{ path: '/account/sign-in', query: route.query }">Sign in</NuxtLink>
    </p>
  </CenteredCard>
</template>

<style scoped>

.authentication-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-fields-grid-pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
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