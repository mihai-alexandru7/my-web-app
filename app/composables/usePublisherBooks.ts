import type { BookToEdit, PublisherBookRow } from '@/types/publisher'

export function usePublisherBooks() {
  const { data, refresh, pending } = useFetch<{ items: PublisherBookRow[]; total: number }>(
      '/api/publisher/books'
  )
  const books = computed(() => data.value?.items ?? [])

  const isModalOpen = ref(false)
  const selectedBook = ref<BookToEdit | null>(null)

  function openUpload() {
    selectedBook.value = null
    isModalOpen.value = true
  }

  async function openEdit(bookId: number) {
    try {
      const res = await $fetch<{ book: BookToEdit }>(`/api/publisher/books/${bookId}`)
      selectedBook.value = res.book
      isModalOpen.value = true
    } catch {
      alert('Could not fetch book details.')
    }
  }

  async function withdraw(bookId: number, title: string) {
    if (!confirm(`Are you sure you want to withdraw "${title}" from sale?`)) return
    try {
      await $fetch(`/api/publisher/books/${bookId}/withdraw`, { method: 'POST' })
      await refresh()
    } catch (err: any) {
      alert(err?.data?.message || 'Could not withdraw book.')
    }
  }

  function closeModal() {
    isModalOpen.value = false
  }

  async function onSaved() {
    closeModal()
    await refresh()
  }

  return { books, pending, isModalOpen, selectedBook, openUpload, openEdit, withdraw, closeModal, onSaved }
}