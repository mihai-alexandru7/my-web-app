<script setup lang="ts">

import { getErrorMessage } from '@/utils/errors'
import type { TableColumn } from '@/components/DataTable.vue'

interface Language {
  id: number
  code: string
  name: string
}

const { data, refresh, pending } = useFetch<{ languages: Language[] }>('/api/languages')
const languages = computed(() => data.value?.languages ?? [])

const columns: TableColumn[] = [
  { key: 'code', label: 'Code', width: '100px' },
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions', align: 'right', width: '180px' }
]

const error = ref('')
const busy = ref(false)

const form = reactive({ code: '', name: '' })
const editingId = ref<number | null>(null)
const draft = reactive({ code: '', name: '' })

async function run(action: () => Promise<unknown>): Promise<boolean> {
  error.value = ''
  busy.value = true
  try {
    await action()
    await refresh()
    return true
  } catch (caughtError) {
    error.value = getErrorMessage(caughtError)
    return false
  } finally {
    busy.value = false
  }
}

async function addLanguage() {
  const success = await run(() => $fetch('/api/administration/languages', { method: 'POST', body: { ...form } }))
  if (success) {
    form.code = ''
    form.name = ''
  }
}

function startEdit(language: Language) {
  editingId.value = language.id
  draft.code = language.code
  draft.name = language.name
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(language: Language) {
  const success = await run(() =>
      $fetch(`/api/administration/languages/${language.id}`, { method: 'PATCH', body: { ...draft } }),
  )
  if (success) editingId.value = null
}

async function removeLanguage(language: Language) {
  if (!confirm(`Delete language "${language.name}" (${language.code})?`)) return
  await run(() => $fetch(`/api/administration/languages/${language.id}`, { method: 'DELETE' }))
}

</script>

<template>
  <div>
    <form class="action-form-bar" @submit.prevent="addLanguage">
      <input
          v-model="form.code"
          class="name-input-control narrow-code-input"
          type="text"
          maxlength="2"
          placeholder="Code"
          aria-label="Language code (2 letters)"
          required
      />
      <input
          v-model="form.name"
          class="name-input-control"
          type="text"
          maxlength="50"
          placeholder="Language name"
          aria-label="Language name"
          required
      />
      <Button type="submit" :disabled="busy || form.code.length !== 2 || !form.name.trim()">
        Add language
      </Button>
    </form>

    <p v-if="error" class="notification-error-message" role="alert">{{ error }}</p>

    <DataTable
        :columns="columns"
        :rows="languages"
        row-key="id"
        :pending="pending"
        loading-message="Loading languages..."
        empty-message="No languages yet."
    >
      <template #cell-code="{ row }">
        <input
            v-if="editingId === row.id"
            v-model="draft.code"
            class="name-input-control narrow-code-input"
            maxlength="2"
            aria-label="Language code"
        />
        <span v-else>{{ row.code }}</span>
      </template>

      <template #cell-name="{ row }">
        <input
            v-if="editingId === row.id"
            v-model="draft.name"
            class="name-input-control"
            maxlength="50"
            aria-label="Language name"
        />
        <span v-else>{{ row.name }}</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="table-actions-container">
          <template v-if="editingId === row.id">
            <Button
                size="small"
                :disabled="busy || draft.code.length !== 2 || !draft.name.trim()"
                @click="saveEdit(row)"
            >
              Save
            </Button>
            <Button size="small" variant="outline" @click="cancelEdit">Cancel</Button>
          </template>
          <template v-else>
            <Button size="small" variant="outline" :disabled="busy" @click="startEdit(row)">Edit</Button>
            <Button size="small" variant="danger" :disabled="busy" @click="removeLanguage(row)">Delete</Button>
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

.narrow-code-input {
  width: 90px;
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