<script setup lang="ts">

import { formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

type Role = 'reader' | 'publisher' | 'administrator'

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

const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Joined' },
  { key: 'actions', label: 'Actions', align: 'right', width: '180px' }
]

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
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
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
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <section>
    <form class="action-form-bar" @submit.prevent="applySearch">
      <input
          v-model="searchInput"
          class="filter-input-control"
          type="search"
          placeholder="Search by name, publisher or email"
          aria-label="Search users"
      />
      <select v-model="role" class="filter-select-control" aria-label="Filter by role">
        <option value="">All roles</option>
        <option value="reader">Reader</option>
        <option value="publisher">Publisher</option>
        <option value="administrator">Administrator</option>
      </select>
      <select v-model="active" class="filter-select-control" aria-label="Filter by status">
        <option value="">Any status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      <Button type="submit">Search</Button>
      <Button variant="outline" type="button" @click="clearFilters">Clear</Button>
    </form>

    <p v-if="error && !detail" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="users"
        row-key="id"
        :pending="pending"
        loading-message="Loading users..."
        empty-message="No users found."
    >
      <template #cell-name="{ row }">
        <strong>{{ getUserDisplayName(row) }}</strong>
      </template>

      <template #cell-role="{ row }">
        <StatusBadge :status="row.role" />
      </template>

      <template #cell-status="{ row }">
        <StatusBadge :status="row.isActive ? 'active' : 'inactive'" />
      </template>

      <template #cell-createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>

      <template #cell-actions="{ row }">
        <div class="table-actions-container">
          <Button size="small" variant="outline" @click="openDetail(row.id)">View</Button>
          <Button
              size="small"
              :variant="row.isActive ? 'danger' : 'outline'"
              :disabled="busy || (row.isActive && row.id === me?.id)"
              :title="row.id === me?.id ? 'You cannot deactivate your own account' : undefined"
              @click="toggleActive(row)"
          >
            {{ row.isActive ? 'Deactivate' : 'Activate' }}
          </Button>
        </div>
      </template>
    </DataTable>

    <Pager v-model:page="page" :total="data?.total ?? 0" :page-size="pageSize" />

    <Modal
        v-if="detail"
        :title="detail.role === 'publisher' ? (detail.publisherProfile?.publisherName || detail.email) : `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim() || detail.email"
        @close="detail = null"
    >
      <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>
      <DescriptionList>
        <template v-if="detail.role === 'publisher'">
          <dt>Publisher name</dt>
          <dd><strong>{{ detail.publisherProfile?.publisherName || '—' }}</strong></dd>
          <dt>About</dt>
          <dd class="multiline-content">{{ detail.publisherProfile?.description || 'No description provided.' }}</dd>
        </template>
        <template v-else>
          <dt>Name</dt>
          <dd>{{ [detail.firstName, detail.lastName].filter(Boolean).join(' ') || '—' }}</dd>
        </template>
        <dt>Email</dt>
        <dd>{{ detail.email }}</dd>
        <dt>Role</dt>
        <dd><StatusBadge :status="detail.role" /></dd>
        <dt>Status</dt>
        <dd>
          <StatusBadge :status="detail.isActive ? 'active' : 'inactive'" />
        </dd>
        <dt>Joined</dt>
        <dd>{{ formatDate(detail.createdAt) }}</dd>
        <dt>Last updated</dt>
        <dd>{{ formatDate(detail.updatedAt) }}</dd>
      </DescriptionList>
      <template #footer>
        <Button
            :variant="detail.isActive ? 'danger' : 'primary'"
            :disabled="busy || (detail.isActive && detail.id === me?.id)"
            @click="toggleActive(detail)"
        >
          {{ detail.isActive ? 'Deactivate' : 'Activate' }}
        </Button>
        <Button variant="outline" @click="detail = null">Close</Button>
      </template>
    </Modal>
  </section>
</template>

<style scoped>

.action-form-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-medium);
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--box-shadow-card);
}

.filter-input-control,
.filter-select-control {
  padding: 10px 14px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.98rem;
}

.notification-error-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1.5px solid var(--color-status-danger);
  background: var(--color-status-danger-background);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-weight: 500;
}

.table-actions-container {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

</style>