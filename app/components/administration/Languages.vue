<script setup lang="ts">

interface Language {
  id: number
  code: string
  name: string
}

const { data, refresh, pending } = useFetch<{ languages: Language[] }>('/api/languages')
const languages = computed(() => data.value?.languages ?? [])

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
  } catch (e) {
    error.value = getErrorMessage(e)
    return false
  } finally {
    busy.value = false
  }
}

async function addLanguage() {
  const ok = await run(() => $fetch('/api/administration/languages', { method: 'POST', body: { ...form } }))
  if (ok) {
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
  const ok = await run(() =>
      $fetch(`/api/administration/languages/${language.id}`, { method: 'PATCH', body: { ...draft } }),
  )
  if (ok) editingId.value = null
}

async function removeLanguage(language: Language) {
  if (!confirm(`Delete language "${language.name}" (${language.code})?`)) return
  await run(() => $fetch(`/api/administration/languages/${language.id}`, { method: 'DELETE' }))
}

</script>

<template>
  <div>
    <form class="administration-card administration-form" @submit.prevent="addLanguage">
      <input
          v-model="form.code"
          class="administration-input administration-input-narrow"
          type="text"
          maxlength="2"
          placeholder="Code"
          aria-label="Language code (2 letters)"
          required
      />
      <input
          v-model="form.name"
          class="administration-input"
          type="text"
          maxlength="50"
          placeholder="Language name"
          aria-label="Language name"
          required
      />
      <button class="administration-button administration-button-primary" type="submit" :disabled="busy || form.code.length !== 2 || !form.name.trim()">
        Add language
      </button>
    </form>

    <p v-if="error" class="administration-notice-error" role="alert">{{ error }}</p>

    <div class="administration-table-wrapper">
      <table class="administration-table">
        <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th style="width: 180px; text-align: right;">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="language in languages" :key="language.id">
          <template v-if="editingId === language.id">
            <td>
              <input v-model="draft.code" class="administration-input administration-input-narrow" maxlength="2" aria-label="Language code" />
            </td>
            <td>
              <input v-model="draft.name" class="administration-input" maxlength="50" aria-label="Language name" />
            </td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button
                  class="administration-button administration-button-small administration-button-primary"
                  type="button"
                  :disabled="busy || draft.code.length !== 2 || !draft.name.trim()"
                  @click="saveEdit(language)"
              >
                Save
              </button>
              <button class="administration-button administration-button-small" type="button" @click="cancelEdit">Cancel</button>
            </td>
          </template>
          <template v-else>
            <td>{{ language.code }}</td>
            <td>{{ language.name }}</td>
            <td class="administration-actions" style="justify-content: flex-end;">
              <button class="administration-button administration-button-small" type="button" :disabled="busy" @click="startEdit(language)">Edit</button>
              <button class="administration-button administration-button-small administration-button-danger" type="button" :disabled="busy" @click="removeLanguage(language)">
                Delete
              </button>
            </td>
          </template>
        </tr>
        </tbody>
      </table>
      <p v-if="!languages.length" class="administration-empty">{{ pending ? 'Loading…' : 'No languages yet.' }}</p>
    </div>
  </div>
</template>
