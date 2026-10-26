<script setup lang="ts">

import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

interface Genre {
  id: number
  name: string
}

const { data, refresh, pending } = useFetch<{ genres: Genre[] }>('/api/genres')
const genres = computed(() => data.value?.genres ?? [])

const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions', align: 'right', width: '180px' }
]

const name = ref('')
const error = ref('')
const busy = ref(false)

const editingId = ref<number | null>(null)
const editingName = ref('')

async function addGenre() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/administration/genres', { method: 'POST', body: { name: name.value.trim() } })
    name.value = ''
    await refresh()
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

function startEdit(genre: Genre) {
  editingId.value = genre.id
  editingName.value = genre.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit(id: number) {
  if (!editingName.value.trim()) return
  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/administration/genres/${id}`, {
      method: 'PATCH',
      body: { name: editingName.value.trim() }
    })
    editingId.value = null
    await refresh()
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

async function removeGenre(genre: Genre) {
  if (!confirm(`Are you sure you want to delete genre "${genre.name}"? It will be removed from all associated books.`)) return

  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/administration/genres/${genre.id}`, { method: 'DELETE' })
    await refresh()
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <div>
    <form class="action-form-bar" @submit.prevent="addGenre">
      <input
          v-model="name"
          class="name-input-control"
          type="text"
          maxlength="100"
          placeholder="New genre name"
          aria-label="New genre name"
          required
      />
      <Button type="submit" :disabled="busy || !name.trim()">
        Add genre
      </Button>
    </form>

    <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="genres"
        row-key="id"
        :pending="pending"
        loading-message="Loading genres..."
        empty-message="No genres found."
    >
      <template #cell-name="{ row }">
        <input
            v-if="editingId === row.id"
            v-model="editingName"
            class="name-input-control inline-edit-input"
            maxlength="100"
            required
            @keydown.enter="saveEdit(row.id)"
            @keydown.esc="cancelEdit"
        />
        <strong v-else>{{ row.name }}</strong>
      </template>

      <template #cell-actions="{ row }">
        <div class="table-actions-container">
          <template v-if="editingId === row.id">
            <Button size="small" :disabled="busy || !editingName.trim()" @click="saveEdit(row.id)">
              Save
            </Button>
            <Button size="small" variant="outline" @click="cancelEdit">Cancel</Button>
          </template>
          <template v-else>
            <Button size="small" variant="outline" :disabled="busy" @click="startEdit(row)">Edit</Button>
            <Button size="small" variant="danger" :disabled="busy" @click="removeGenre(row)">Delete</Button>
          </template>
        </div>
      </template>
    </DataTable>
  </div>
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

.name-input-control {
  padding: 10px 14px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.98rem;
}

.inline-edit-input {
  width: 100%;
  max-width: 320px;
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