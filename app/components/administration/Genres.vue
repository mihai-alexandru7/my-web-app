<script setup lang="ts">

interface Genre {
  id: number
  name: string
}

const { data, refresh, pending } = useFetch<{ genres: Genre[] }>('/api/genres')
const genres = computed(() => data.value?.genres ?? [])

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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  } catch (e) {
    error.value = getErrorMessage(e)
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
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <div>
    <form class="administration-card administration-form" @submit.prevent="addGenre">
      <input
          v-model="name"
          class="administration-input"
          type="text"
          maxlength="100"
          placeholder="New genre name"
          aria-label="New genre name"
          required
      />
      <button class="administration-button administration-button-primary" type="submit" :disabled="busy || !name.trim()">
        Add genre
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
        <tr v-for="genre in genres" :key="genre.id">
          <template v-if="editingId === genre.id">
            <td>
              <input
                  v-model="editingName"
                  class="administration-input"
                  style="width: 100%; max-width: 320px;"
                  maxlength="100"
                  required
                  @keydown.enter="saveEdit(genre.id)"
                  @keydown.esc="cancelEdit"
              />
            </td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button
                  class="administration-button administration-button-small administration-button-primary"
                  type="button"
                  :disabled="busy || !editingName.trim()"
                  @click="saveEdit(genre.id)"
              >
                Save
              </button>
              <button class="administration-button administration-button-small" type="button" @click="cancelEdit">
                Cancel
              </button>
            </td>
          </template>
          <template v-else>
            <td><strong>{{ genre.name }}</strong></td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button
                  class="administration-button administration-button-small"
                  type="button"
                  :disabled="busy"
                  @click="startEdit(genre)"
              >
                Edit
              </button>
              <button
                  class="administration-button administration-button-small administration-button-danger"
                  type="button"
                  :disabled="busy"
                  @click="removeGenre(genre)"
              >
                Delete
              </button>
            </td>
          </template>
        </tr>
        </tbody>
      </table>
      <p v-if="!genres.length" class="administration-empty">{{ pending ? 'Loading…' : 'No genres found.' }}</p>
    </div>
  </div>
</template>
