<script setup lang="ts">

import '@/assets/css/account.css'
import { getFieldErrors, getErrorMessage } from '@/utils/errors'

useSeoMeta({ title: 'My Account' })

const { loggedIn, clear, fetch: refreshSession } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/account/sign-in?redirect=/account')
}

const { data, refresh } = await useFetch<{
  user: {
    id: number
    email: string
    firstName: string | null
    lastName: string | null
    role: 'reader' | 'publisher' | 'administration'
    createdAt: string
    publisherProfile?: {
      publisherName: string
      description: string | null
    } | null
  }
}>('/api/account/me')

const currentUser = computed(() => data.value?.user)

function formatDateOnly(value: string | Date | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Bucharest'
  }).format(new Date(value))
}

type ActiveModal = 'profile' | 'email' | 'password' | 'delete' | null
const activeModal = ref<ActiveModal>(null)

const profileForm = reactive({ firstName: '', lastName: '', publisherName: '', publisherDescription: '' })
const emailForm = reactive({ newEmail: '', password: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const deleteForm = reactive({ password: '' })

const passwordRulesRef = ref<{ isValid: boolean } | null>(null)
const submitting = ref(false)
const modalError = ref('')
const fieldErrors = ref<Record<string, string>>({})

function openModal(modal: ActiveModal) {
  modalError.value = ''
  fieldErrors.value = {}

  if (modal === 'profile' && currentUser.value) {
    profileForm.firstName = currentUser.value.firstName || ''
    profileForm.lastName = currentUser.value.lastName || ''
    profileForm.publisherName = currentUser.value.publisherProfile?.publisherName || ''
    profileForm.publisherDescription = currentUser.value.publisherProfile?.description || ''
  } else if (modal === 'email' && currentUser.value) {
    emailForm.newEmail = currentUser.value.email
    emailForm.password = ''
  } else if (modal === 'password') {
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } else if (modal === 'delete') {
    deleteForm.password = ''
  }

  activeModal.value = modal
}

function closeModal() {
  activeModal.value = null
  modalError.value = ''
  fieldErrors.value = {}
}

async function handleSaveProfile() {
  submitting.value = true
  modalError.value = ''
  fieldErrors.value = {}

  try {
    const isPublisher = currentUser.value?.role === 'publisher'
    const body = isPublisher
        ? {
          publisherName: profileForm.publisherName.trim(),
          publisherDescription: profileForm.publisherDescription.trim() || undefined
        }
        : {
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim()
        }

    await $fetch('/api/account/profile', {
      method: 'PATCH',
      body
    })
    await refresh()
    await refreshSession()
    closeModal()
  } catch (err) {
    const fields = getFieldErrors(err)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function handleSaveEmail() {
  submitting.value = true
  modalError.value = ''
  fieldErrors.value = {}

  try {
    await $fetch('/api/account/email', {
      method: 'PATCH',
      body: {
        newEmail: emailForm.newEmail.trim(),
        password: emailForm.password
      }
    })
    await refresh()
    await refreshSession()
    closeModal()
  } catch (err) {
    const fields = getFieldErrors(err)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function handleSavePassword() {
  fieldErrors.value = {}

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    fieldErrors.value.confirmPassword = 'Passwords do not match.'
    return
  }

  if (!passwordRulesRef.value?.isValid) return

  submitting.value = true
  modalError.value = ''

  try {
    await $fetch('/api/account/password', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }
    })
    closeModal()
  } catch (err) {
    const fields = getFieldErrors(err)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function handleDeleteAccount() {
  if (!deleteForm.password) {
    modalError.value = 'Please enter your password to confirm account deletion.'
    return
  }

  submitting.value = true
  modalError.value = ''

  try {
    await $fetch('/api/account', {
      method: 'DELETE',
      body: { password: deleteForm.password }
    })
    await clear()
    await navigateTo('/')
  } catch (err) {
    modalError.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="account-page">
    <main class="account-main-wrapper-box">
      <header class="account-main-card-header">
        <h1 class="account-main-card-title">Manage your account</h1>
      </header>

      <div class="account-inner-grid">
        <section class="account-box-card">
          <header class="panel-header">
            <h2 class="panel-title">Personal details</h2>
          </header>

          <div class="details-stack">
            <div class="detail-row">
              <AccountDetailBox label="Account type">
                <div>
                  <span class="account-role-badge">{{ currentUser?.role }}</span>
                </div>
              </AccountDetailBox>

              <AccountDetailBox label="Member since" :value="formatDateOnly(currentUser?.createdAt)" />
            </div>

            <div v-if="currentUser?.role !== 'publisher'" class="detail-row">
              <AccountDetailBox label="First name" :value="currentUser?.firstName" />
              <AccountDetailBox label="Last name" :value="currentUser?.lastName" />
            </div>

            <AccountDetailBox
                v-else
                label="Publisher name"
                :value="currentUser?.publisherProfile?.publisherName"
            />

            <AccountDetailBox label="Email address">
              <span class="detail-value text-break">{{ currentUser?.email }}</span>
            </AccountDetailBox>

            <AccountDetailBox v-if="currentUser?.role === 'publisher'" label="Description">
              <span class="detail-value text-multiline">
                {{ currentUser?.publisherProfile?.description || 'No description provided.' }}
              </span>
            </AccountDetailBox>
          </div>
        </section>

        <section class="account-box-card">
          <header class="panel-header">
            <h2 class="panel-title">Account options</h2>
          </header>

          <div class="actions-stack">
            <AccountActionTile
                v-if="currentUser?.role !== 'publisher'"
                title="Edit Name"
                description="Update your first and last name"
                @click="openModal('profile')"
            />

            <AccountActionTile
                v-else
                title="Change your personal details"
                description=""
                @click="openModal('profile')"
            />

            <AccountActionTile
                title="Change your email address"
                description=""
                @click="openModal('email')"
            />

            <AccountActionTile
                title="Change your password"
                description=""
                @click="openModal('password')"
            />

            <div class="actions-divider" />

            <AccountActionTile
                title="Delete your account"
                description=""
                danger
                @click="openModal('delete')"
            />
          </div>
        </section>
      </div>
    </main>

    <AccountModal
        v-if="activeModal === 'profile'"
        title="Change your personal details"
        @close="closeModal"
    >
      <form @submit.prevent="handleSaveProfile">
        <div class="modal-body">
          <p v-if="modalError" class="account-message-error">{{ modalError }}</p>

          <div v-if="currentUser?.role !== 'publisher'" class="form-row">
            <AccountFormField
                v-model="profileForm.firstName"
                label="First name"
                name="firstName"
                :show-label="true"
                :error="fieldErrors.firstName"
                required
            />
            <AccountFormField
                v-model="profileForm.lastName"
                label="Last name"
                name="lastName"
                :show-label="true"
                :error="fieldErrors.lastName"
                required
            />
          </div>

          <template v-else>
            <AccountFormField
                v-model="profileForm.publisherName"
                label="Publisher name"
                name="publisherName"
                :show-label="true"
                :error="fieldErrors.publisherName"
                required
            />
            <AccountFormField
                v-model="profileForm.publisherDescription"
                label="Publisher description"
                name="publisherDescription"
                multiline
                :rows="4"
                :show-label="true"
            />
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="account-button-outline" @click="closeModal">Cancel</button>
          <button type="submit" class="account-button-primary" :disabled="submitting">
            {{ submitting ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </AccountModal>

    <AccountModal
        v-else-if="activeModal === 'email'"
        title="Change your email address"
        @close="closeModal"
    >
      <form @submit.prevent="handleSaveEmail">
        <div class="modal-body">
          <p v-if="modalError" class="account-message-error">{{ modalError }}</p>
          <AccountFormField
              v-model="emailForm.newEmail"
              label="New email address"
              name="newEmail"
              type="email"
              :show-label="true"
              :error="fieldErrors.newEmail"
              required
          />
          <AccountFormField
              v-model="emailForm.password"
              label="Current password"
              name="password"
              type="password"
              :show-label="true"
              :error="fieldErrors.password"
              required
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="account-button-outline" @click="closeModal">Cancel</button>
          <button type="submit" class="account-button-primary" :disabled="submitting">
            {{ submitting ? 'Changing…' : 'Change email' }}
          </button>
        </div>
      </form>
    </AccountModal>

    <AccountModal
        v-else-if="activeModal === 'password'"
        title="Change your password"
        @close="closeModal"
    >
      <form @submit.prevent="handleSavePassword">
        <div class="modal-body">
          <p v-if="modalError" class="account-message-error">{{ modalError }}</p>
          <AccountFormField
              v-model="passwordForm.currentPassword"
              label="Current password"
              name="currentPassword"
              type="password"
              :show-label="true"
              :error="fieldErrors.currentPassword"
              required
          />
          <AccountFormField
              v-model="passwordForm.newPassword"
              label="New password"
              name="newPassword"
              type="password"
              :show-label="true"
              :error="fieldErrors.newPassword"
              required
          >
            <template #hint>
              <AccountPasswordRules ref="passwordRulesRef" :password="passwordForm.newPassword" />
            </template>
          </AccountFormField>
          <AccountFormField
              v-model="passwordForm.confirmPassword"
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              :show-label="true"
              :error="fieldErrors.confirmPassword"
              required
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="account-button-outline" @click="closeModal">Cancel</button>
          <button type="submit" class="account-button-primary" :disabled="submitting">
            {{ submitting ? 'Changing…' : 'Change password' }}
          </button>
        </div>
      </form>
    </AccountModal>

    <AccountModal
        v-else-if="activeModal === 'delete'"
        title="Confirm account deletion"
        danger
        @close="closeModal"
    >
      <form @submit.prevent="handleDeleteAccount">
        <div class="modal-body">
          <p class="delete-warning-text">
            Warning! This action is permanent. Your account, personal data, and access to purchased books will be permanently deleted.
          </p>
          <p v-if="modalError" class="account-message-error">{{ modalError }}</p>
          <AccountFormField
              v-model="deleteForm.password"
              label="Confirm with your password"
              name="password"
              type="password"
              :show-label="true"
              placeholder="Enter your current password"
              required
          />
        </div>
        <div class="modal-footer">
          <button type="button" class="account-button-outline" @click="closeModal">Cancel</button>
          <button type="submit" class="account-button-danger" :disabled="submitting || !deleteForm.password">
            {{ submitting ? 'Deleting…' : 'Delete account' }}
          </button>
        </div>
      </form>
    </AccountModal>
  </div>
</template>
