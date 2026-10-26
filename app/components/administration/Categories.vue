<script setup lang="ts">

import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

interface Category {
  id: number
  name: string
}

const { data, refresh, pending } = useFetch<{ categories: Category[] }>('/api/categories')
const categories = computed(() => data.value?.categories ?? [])

const columns: TableColumn[] = [
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions', align: 'right', width: '180px' }
]

const name = ref('')
const error = ref('')
const busy = ref(false)

const editingId = ref<number | null>(null)
const editingName = ref('')

async function addCategory() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/administration/categories', { method: 'POST', body: { name: name.value.trim() } })
    name.value = ''
    await refresh()
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

function startEdit(category: Category) {
  editingId.value = category.id
  editingName.value = category.name
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
    await $fetch(`/api/administration/categories/${id}`, {
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

async function removeCategory(category: Category) {
  if (!confirm(`Are you sure you want to delete category "${category.name}"? It will be removed from all associated books.`)) return

  error.value = ''
  busy.value = true
  try {
    await $fetch(`/api/administration/categories/${category.id}`, { method: 'DELETE' })
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
    <form class="action-form-bar" @submit.prevent="addCategory">
      <input
          v-model="name"
          class="name-input-control"
          type="text"
          maxlength="100"
          placeholder="New category name"
          aria-label="New category name"
          required
      />
      <Button type="submit" :disabled="busy || !name.trim()">
        Add category
      </Button>
    </form>

    <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="categories"
        row-key="id"
        :pending="pending"
        loading-message="Loading categories..."
        empty-message="No categories found."
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
            <Button size="small" variant="danger" :disabled="busy" @click="removeCategory(row)">Delete</Button>
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