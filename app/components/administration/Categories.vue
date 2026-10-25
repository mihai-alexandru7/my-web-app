<script setup lang="ts">

interface Category {
  id: number
  name: string
}

const { data, refresh, pending } = useFetch<{ categories: Category[] }>('/api/categories')
const categories = computed(() => data.value?.categories ?? [])

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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <div>
    <form class="administration-card administration-form" @submit.prevent="addCategory">
      <input
          v-model="name"
          class="administration-input"
          type="text"
          maxlength="100"
          placeholder="New category name"
          aria-label="New category name"
          required
      />
      <button class="administration-button administration-button-primary" type="submit" :disabled="busy || !name.trim()">
        Add category
      </button>
    </form>

    <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>

    <div class="administration-table-wrapper">
      <table class="administration-table">
        <thead>
        <tr>
          <th>Name</th>
          <th style="width: 180px; text-align: right;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="category in categories" :key="category.id">
          <template v-if="editingId === category.id">
            <td>
              <input
                  v-model="editingName"
                  class="administration-input"
                  style="width: 100%; max-width: 320px;"
                  maxlength="100"
                  required
                  @keydown.enter="saveEdit(category.id)"
                  @keydown.esc="cancelEdit"
              />
            </td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button
                  class="administration-button administration-button-small administration-button-primary"
                  type="button"
                  :disabled="busy || !editingName.trim()"
                  @click="saveEdit(category.id)"
              >
                Save
              </button>
              <button class="administration-button administration-button-small" type="button" @click="cancelEdit">
                Cancel
              </button>
            </td>
          </template>
          <template v-else>
            <td><strong>{{ category.name }}</strong></td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button
                  class="administration-button administration-button-small"
                  type="button"
                  :disabled="busy"
                  @click="startEdit(category)"
              >
                Edit
              </button>
              <button
                  class="administration-button administration-button-small administration-button-danger"
                  type="button"
                  :disabled="busy"
                  @click="removeCategory(category)"
              >
                Delete
              </button>
            </td>
          </template>
        </tr>
        </tbody>
      </table>
      <p v-if="!categories.length" class="administration-empty">{{ pending ? 'Loading…' : 'No categories found.' }}</p>
    </div>
  </div>
</template>
