<script setup lang="ts">

import { formatDate } from '@/utils/formatters'

type Role = 'reader' | 'publisher' | 'administrator' | 'administration'

interface UserRow {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  role: Role
  isActive: boolean
  createdAt: string
  publisherName?: string | null
}

interface UserDetail extends UserRow {
  updatedAt: string
  publisherProfile: { publisherName: string; description: string | null } | null
}

const { user: me } = useUserSession()

const searchInput = ref('')
const search = ref('')
const role = ref<'' | Role>('')
const active = ref<'' | 'true' | 'false'>('')
const page = ref(1)
const pageSize = 15

const query = computed(() => ({
  search: search.value || undefined,
  role: role.value || undefined,
  isActive: active.value || undefined,
  page: page.value,
  pageSize,
}))

const { data, refresh, pending } = useFetch<{ items: UserRow[]; total: number }>('/api/administration/users', { query })
const users = computed(() => data.value?.items ?? [])

watch([role, active], () => {
  page.value = 1
})

const error = ref('')
const busy = ref(false)
const detail = ref<UserDetail | null>(null)

function applySearch() {
  search.value = searchInput.value.trim()
  page.value = 1
}

function clearFilters() {
  searchInput.value = ''
  search.value = ''
  role.value = ''
  active.value = ''
  page.value = 1
}

function getUserDisplayName(user: { role: Role; publisherName?: string | null; firstName?: string | null; lastName?: string | null }): string {
  if (user.role === 'publisher') {
    return user.publisherName || 'Unnamed Publisher'
  }
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || '—'
}

async function openDetail(id: number) {
  error.value = ''
  try {
    const response = await $fetch<{ user: UserDetail }>(`/api/administration/users/${id}`)
    detail.value = response.user
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}

async function toggleActive(user: UserRow) {
  const activating = !user.isActive
  const displayName = getUserDisplayName(user)
  if (!activating && !confirm(`Deactivate ${displayName} (${user.email})?`)) return

  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/administration/users/${user.id}/status`, { method: 'PATCH', body: { isActive: activating } })
    await refresh()
    if (detail.value?.id === user.id) detail.value.isActive = activating
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <section>
    <form class="administration-card administration-form" @submit.prevent="applySearch">
      <input
          v-model="searchInput"
          class="administration-input"
          type="search"
          placeholder="Search by name, publisher or email"
          aria-label="Search users"
      />
      <select v-model="role" class="administration-select" aria-label="Filter by role">
        <option value="">All roles</option>
        <option value="reader">Reader</option>
        <option value="publisher">Publisher</option>
        <option value="administrator">Administrator</option>
      </select>
      <select v-model="active" class="administration-select" aria-label="Filter by status">
        <option value="">Any status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      <button class="administration-button administration-button-primary" type="submit">Search</button>
      <button class="administration-button" type="button" @click="clearFilters">Clear</button>
    </form>

    <p v-if="error && !detail" class="administration-notice-error" role="alert">{{ error }}</p>

    <div class="administration-table-wrapper">
      <table class="administration-table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Joined</th>
          <th style="width: 180px; text-align: right;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id">
          <td><strong>{{ getUserDisplayName(user) }}</strong></td>
          <td>{{ user.email }}</td>
          <td><span class="administration-badge" :class="`administration-badge-${user.role}`">{{ user.role }}</span></td>
          <td>
            <span class="administration-badge" :class="user.isActive ? 'administration-badge-active' : 'administration-badge-inactive'">
              {{ user.isActive ? 'active' : 'inactive' }}
            </span>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td class="administration-actions" style="justify-content: flex-end;">
            <button class="administration-button administration-button-small" type="button" @click="openDetail(user.id)">View</button>
            <button
                class="administration-button administration-button-small"
                :class="{ 'administration-button-danger': user.isActive }"
                type="button"
                :disabled="busy || (user.isActive && user.id === me?.id)"
                :title="user.id === me?.id ? 'You cannot deactivate your own account' : undefined"
                @click="toggleActive(user)"
            >
              {{ user.isActive ? 'Deactivate' : 'Activate' }}
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <p v-if="!users.length" class="administration-empty">{{ pending ? 'Loading…' : 'No users found.' }}</p>
    </div>

    <AdministrationPager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />

    <AdministrationModal
        v-if="detail"
        :title="detail.role === 'publisher' ? (detail.publisherProfile?.publisherName || detail.email) : `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim() || detail.email"
        @close="detail = null"
    >
      <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>
      <dl class="administration-description-list">
        <template v-if="detail.role === 'publisher'">
          <dt>Publisher name</dt>
          <dd><strong>{{ detail.publisherProfile?.publisherName || '—' }}</strong></dd>
          <dt>About</dt>
          <dd class="administration-prewrap">{{ detail.publisherProfile?.description || 'No description provided.' }}</dd>
        </template>
        <template v-else>
          <dt>Name</dt>
          <dd>{{ [detail.firstName, detail.lastName].filter(Boolean).join(' ') || '—' }}</dd>
        </template>
        <dt>Email</dt>
        <dd>{{ detail.email }}</dd>
        <dt>Role</dt>
        <dd><span class="administration-badge" :class="`administration-badge-${detail.role}`">{{ detail.role }}</span></dd>
        <dt>Status</dt>
        <dd>
          <span class="administration-badge" :class="detail.isActive ? 'administration-badge-active' : 'administration-badge-inactive'">
            {{ detail.isActive ? 'active' : 'inactive' }}
          </span>
        </dd>
        <dt>Joined</dt>
        <dd>{{ formatDate(detail.createdAt) }}</dd>
        <dt>Last updated</dt>
        <dd>{{ formatDate(detail.updatedAt) }}</dd>
      </dl>
      <template #footer>
        <button
            class="administration-button"
            :class="{ 'administration-button-danger': detail.isActive }"
            type="button"
            :disabled="busy || (detail.isActive && detail.id === me?.id)"
            @click="toggleActive(detail)"
        >
          {{ detail.isActive ? 'Deactivate' : 'Activate' }}
        </button>
        <button class="administration-button" type="button" @click="detail = null">Close</button>
      </template>
    </AdministrationModal>
  </section>
</template>
