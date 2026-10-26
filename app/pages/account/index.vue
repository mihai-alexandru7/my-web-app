<script setup lang="ts">

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
    role: 'reader' | 'publisher' | 'administrator'
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
  } catch (caughtError) {
    const fields = getFieldErrors(caughtError)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(caughtError)
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
  } catch (caughtError) {
    const fields = getFieldErrors(caughtError)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(caughtError)
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
  } catch (caughtError) {
    const fields = getFieldErrors(caughtError)
    if (Object.keys(fields).length > 0) fieldErrors.value = fields
    else modalError.value = getErrorMessage(caughtError)
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
  } catch (caughtError) {
    modalError.value = getErrorMessage(caughtError)
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="account-page-wrapper">
    <main class="account-card-container">
      <header class="account-header">
        <h1 class="account-header-title">Manage your account</h1>
      </header>

      <div class="account-layout-grid">
        <section class="account-card-panel">
          <header class="panel-header">
            <h2 class="panel-title">Personal details</h2>
          </header>

          <div class="details-stack">
            <div class="detail-row">
              <DetailBox label="Account type">
                <StatusBadge :status="currentUser?.role || ''" />
              </DetailBox>

              <DetailBox label="Member since" :value="formatDateOnly(currentUser?.createdAt)" />
            </div>

            <div v-if="currentUser?.role !== 'publisher'" class="detail-row">
              <DetailBox label="First name" :value="currentUser?.firstName" />
              <DetailBox label="Last name" :value="currentUser?.lastName" />
            </div>

            <DetailBox
                v-else
                label="Publisher name"
                :value="currentUser?.publisherProfile?.publisherName"
            />

            <DetailBox label="Email address">
              <span class="detail-value text-break-word">{{ currentUser?.email }}</span>
            </DetailBox>

            <DetailBox v-if="currentUser?.role === 'publisher'" label="Description">
              <span class="detail-value text-multiline-display">
                {{ currentUser?.publisherProfile?.description || 'No description provided.' }}
              </span>
            </DetailBox>
          </div>
        </section>

        <section class="account-card-panel">
          <header class="panel-header">
            <h2 class="panel-title">Account options</h2>
          </header>

          <div class="actions-stack">
            <ActionTile
                title="Change your personal details"
                description=""
                @click="openModal('profile')"
            />

            <ActionTile
                title="Change your email address"
                description=""
                @click="openModal('email')"
            />

            <ActionTile
                title="Change your password"
                description=""
                @click="openModal('password')"
            />

            <div class="actions-separator" />

            <ActionTile
                title="Delete your account"
                description=""
                danger
                @click="openModal('delete')"
            />
          </div>
        </section>
      </div>
    </main>

    <Modal
        v-if="activeModal === 'profile'"
        title="Change your personal details"
        @close="closeModal"
    >
      <form class="account-modal-form" @submit.prevent="handleSaveProfile">
        <p v-if="modalError" class="modal-notification-error">{{ modalError }}</p>

        <div v-if="currentUser?.role !== 'publisher'" class="modal-form-pair">
          <FormField
              v-model="profileForm.firstName"
              label="First name"
              name="firstName"
              :show-label="true"
              :error="fieldErrors.firstName"
              required
          />
          <FormField
              v-model="profileForm.lastName"
              label="Last name"
              name="lastName"
              :show-label="true"
              :error="fieldErrors.lastName"
              required
          />
        </div>

        <template v-else>
          <FormField
              v-model="profileForm.publisherName"
              label="Publisher name"
              name="publisherName"
              :show-label="true"
              :error="fieldErrors.publisherName"
              required
          />
          <FormField
              v-model="profileForm.publisherDescription"
              label="Publisher description"
              name="publisherDescription"
              multiline
              :rows="4"
              :show-label="true"
          />
        </template>

        <div class="modal-actions-footer">
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'Saving…' : 'Save changes' }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal
        v-if="activeModal === 'email'"
        title="Change your email address"
        @close="closeModal"
    >
      <form class="account-modal-form" @submit.prevent="handleSaveEmail">
        <p v-if="modalError" class="modal-notification-error">{{ modalError }}</p>
        <FormField
            v-model="emailForm.newEmail"
            label="New email address"
            name="newEmail"
            type="email"
            :show-label="true"
            :error="fieldErrors.newEmail"
            required
        />
        <FormField
            v-model="emailForm.password"
            label="Current password"
            name="password"
            type="password"
            :show-label="true"
            :error="fieldErrors.password"
            required
        />

        <div class="modal-actions-footer">
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'Changing…' : 'Change email' }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal
        v-if="activeModal === 'password'"
        title="Change your password"
        @close="closeModal"
    >
      <form class="account-modal-form" @submit.prevent="handleSavePassword">
        <p v-if="modalError" class="modal-notification-error">{{ modalError }}</p>
        <FormField
            v-model="passwordForm.currentPassword"
            label="Current password"
            name="currentPassword"
            type="password"
            :show-label="true"
            :error="fieldErrors.currentPassword"
            required
        />
        <FormField
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
        </FormField>
        <FormField
            v-model="passwordForm.confirmPassword"
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            :show-label="true"
            :error="fieldErrors.confirmPassword"
            required
        />

        <div class="modal-actions-footer">
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'Changing…' : 'Change password' }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal
        v-if="activeModal === 'delete'"
        title="Confirm account deletion"
        danger
        @close="closeModal"
    >
      <form class="account-modal-form" @submit.prevent="handleDeleteAccount">
        <p class="deletion-warning-notice">
          Warning! This action is permanent. Your account, personal data, and access to purchased books will be permanently deleted.
        </p>
        <p v-if="modalError" class="modal-notification-error">{{ modalError }}</p>
        <FormField
            v-model="deleteForm.password"
            label="Confirm with your password"
            name="password"
            type="password"
            :show-label="true"
            placeholder="Enter your current password"
            required
        />

        <div class="modal-actions-footer">
          <Button variant="outline" @click="closeModal">Cancel</Button>
          <Button type="submit" variant="danger" :disabled="submitting || !deleteForm.password">
            {{ submitting ? 'Deleting…' : 'Delete account' }}
          </Button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>

.account-page-wrapper {
  min-height: 100vh;
  padding: 100px 24px 60px;
  box-sizing: border-box;
  font-family: var(--font-family-serif);
  color: var(--color-text-primary);
  background: var(--color-background-page);
}

.account-card-container {
  max-width: 1100px;
  margin: 0 auto;
  background: var(--color-background-surface-card);
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-large);
  padding: 36px;
  box-shadow: var(--box-shadow-elevated);
}

.account-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.account-header-title {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 400;
  color: var(--color-action-primary);
}

.account-layout-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 28px;
  align-items: start;
}

.account-card-panel {
  background: #ffffff;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius-medium);
  padding: 24px;
  box-shadow: var(--box-shadow-card);
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-card);
}

.panel-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-action-primary);
}

.details-stack,
.actions-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.actions-separator {
  height: 1px;
  background: var(--color-border-card);
  margin: 4px 0;
}

.text-break-word {
  word-break: break-all;
}

.text-multiline-display {
  white-space: pre-wrap;
  line-height: 1.5;
}

.account-modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-form-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-notification-error {
  margin: 0;
  padding: 10px 14px;
  background: var(--color-status-danger-background);
  border: 1px solid var(--color-status-danger);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-size: 0.9rem;
}

.deletion-warning-notice {
  margin: 0;
  padding: 12px 14px;
  background: var(--color-status-danger-background);
  border: 1px solid var(--color-status-danger-border);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-size: 0.95rem;
  line-height: 1.4;
}

.modal-actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .account-layout-grid {
    grid-template-columns: 1fr;
  }
}

</style>