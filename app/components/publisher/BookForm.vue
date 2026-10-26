<script setup lang="ts">

import { getErrorMessage } from '@/utils/errors'
import type { BookToEdit, NamedItem } from '@/types/publisher'

const props = defineProps<{
  book?: BookToEdit | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const isEdit = computed(() => Boolean(props.book))

const form = reactive({
  title: props.book?.title || '',
  authors: props.book?.authors.map(a => a.name).join(', ') || '',
  price: props.book?.price || '',
  languageId: '' as string | number,
  isbn: props.book?.isbn || '',
  publishedYear: props.book?.publishedYear || '',
  description: props.book?.description || '',
  genreIds: props.book?.genres.map(g => g.id) || [] as number[],
  categoryIds: props.book?.categories.map(c => c.id) || [] as number[],
})

const bookFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)
const sampleFile = ref<File | null>(null)

const { data: genresData } = await useFetch<{ genres: NamedItem[] }>('/api/genres')
const { data: categoriesData } = await useFetch<{ categories: NamedItem[] }>('/api/categories')
const { data: languagesData } = await useFetch<{ languages: { id: number; code: string; name: string }[] }>('/api/languages')

const languageOptions = computed(() =>
    languagesData.value?.languages.map(language => ({ value: language.id, label: `${language.name} (${language.code})` })) || []
)

onMounted(() => {
  if (props.book && languagesData.value?.languages) {
    const matched = languagesData.value.languages.find(language => language.code === props.book?.language.code)
    if (matched) form.languageId = matched.id
  }
})

const submitting = ref(false)
const error = ref('')

async function submitForm() {
  submitting.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('price', String(form.price))
    formData.append('languageId', String(form.languageId))
    if (form.description) formData.append('description', form.description.trim())
    if (form.isbn) formData.append('isbn', form.isbn.trim())
    if (form.publishedYear) formData.append('publishedYear', String(form.publishedYear))

    form.authors.split(',').map(name => name.trim()).filter(Boolean).forEach(author => formData.append('authors[]', author))
    form.genreIds.forEach(id => formData.append('genreIds[]', String(id)))
    form.categoryIds.forEach(id => formData.append('categoryIds[]', String(id)))

    if (bookFile.value) formData.append('file', bookFile.value)
    if (coverFile.value) formData.append('cover', coverFile.value)
    if (sampleFile.value) formData.append('sample', sampleFile.value)

    if (isEdit.value && props.book) {
      await $fetch(`/api/publisher/books/${props.book.id}`, {
        method: 'PATCH',
        body: formData,
      })
    } else {
      await $fetch('/api/publisher/books', {
        method: 'POST',
        body: formData,
      })
    }

    emit('saved')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <form class="book-form-container" @submit.prevent="submitForm">
    <p v-if="error" class="form-error-message" role="alert">{{ error }}</p>

    <FormField
        v-model="form.title"
        label="Title"
        placeholder="Book title"
        required
    />

    <FormField
        v-model="form.authors"
        label="Author"
        placeholder="Book author"
        required
    />

    <div class="form-grid-pair">
      <FormField
          v-model="form.price"
          label="Price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
      />
      <SelectField
          v-model="form.languageId"
          label="Language"
          :options="languageOptions"
          placeholder="Select language"
          required
      />
    </div>

    <div class="form-grid-pair">
      <FormField
          v-model="form.isbn"
          label="ISBN"
          placeholder="ISBN-10 or ISBN-13"
      />
      <FormField
          v-model="form.publishedYear"
          label="Publication year"
          type="number"
          min="1000"
          :max="new Date().getFullYear() + 1"
          placeholder="YYYY"
      />
    </div>

    <CheckboxGroup
        v-model="form.genreIds"
        label="Genres"
        :items="genresData?.genres || []"
        required
    />

    <CheckboxGroup
        v-model="form.categoryIds"
        label="Categories"
        :items="categoriesData?.categories || []"
    />

    <FormField
        v-model="form.description"
        label="Description"
        multiline
        placeholder="Detailed synopsis of the book..."
    />

    <hr class="form-section-divider" />

    <FileInput
        label="Cover image"
        accept=".jpg,.jpeg,.png,.webp"
        hint="JPG or PNG"
        @select="file => coverFile = file"
    />

    <div class="form-grid-pair">
      <FileInput
          label="Book file"
          accept=".pdf,.epub"
          hint="PDF or EPUB"
          :required="!isEdit"
          @select="file => bookFile = file"
      />

      <FileInput
          label="Free book excerpt"
          accept=".pdf,.epub"
          hint="PDF or EPUB"
          @select="file => sampleFile = file"
      />
    </div>

    <div class="form-actions-footer">
      <Button variant="outline" @click="emit('close')">Cancel</Button>
      <Button type="submit" :disabled="submitting || form.genreIds.length === 0">
        {{ submitting ? 'Uploading & Saving...' : (isEdit ? 'Save Changes' : 'Upload Book') }}
      </Button>
    </div>
  </form>
</template>

<style scoped>

.book-form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-section-divider {
  border: 0;
  border-top: 1px solid var(--color-border-subtle);
  margin: 6px 0;
}

.form-error-message {
  margin: 0;
  padding: 10px 14px;
  background: var(--color-status-danger-background);
  border: 1px solid var(--color-status-danger);
  border-radius: var(--border-radius-small);
  color: var(--color-status-danger);
  font-size: 0.95rem;
}

.form-actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .form-grid-pair {
    grid-template-columns: 1fr;
  }
}

</style>