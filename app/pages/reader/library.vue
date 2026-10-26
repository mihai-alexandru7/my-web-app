<script setup lang="ts">

import { formatDate } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'

definePageMeta({ middleware: 'reader' })
useSeoMeta({ title: 'My Library' })

const { loggedIn } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/account/sign-in?redirect=/reader/library')
}

interface OwnedBook {
  bookId: number
  title: string
  coverPath: string | null
  publisherName: string
  acquiredAt: string
  lastPosition: string | null
  lastReadAt: string | null
  rating: number | null
  comment: string | null
}

interface CollectionItem {
  id: number
  name: string
  createdAt: string
  booksCount: number
}

interface CollectionDetailBook {
  bookId: number
  title: string
  coverPath: string | null
  publisherName: string
  addedAt: string
}

const { data: libraryData, refresh: refreshLibrary, pending: libraryPending } = await useFetch<{ books: OwnedBook[] }>('/api/library')
const { data: collectionsData, refresh: refreshCollections } = await useFetch<{ collections: CollectionItem[] }>('/api/collections')

const ownedBooks = computed(() => libraryData.value?.books ?? [])
const collections = computed(() => collectionsData.value?.collections ?? [])

const expandedCollections = ref<Set<number | string>>(new Set(['all-purchased']))
const collectionBooksMap = ref<Record<number, CollectionDetailBook[]>>({})
const loadingCollectionId = ref<number | null>(null)

async function toggleCollection(identifier: number | string) {
  if (expandedCollections.value.has(identifier)) {
    expandedCollections.value.delete(identifier)
    return
  }

  expandedCollections.value.add(identifier)

  if (typeof identifier === 'number') {
    loadingCollectionId.value = identifier
    try {
      const response = await $fetch<{ collection: { books: CollectionDetailBook[] } }>(`/api/collections/${identifier}`)
      collectionBooksMap.value[identifier] = response.collection.books
    } catch (caughtError) {
      console.error(caughtError)
    } finally {
      loadingCollectionId.value = null
    }
  }
}

const isCreateModalOpen = ref(false)
const newCollectionName = ref('')
const createError = ref('')
const createBusy = ref(false)

async function handleCreateCollection() {
  if (!newCollectionName.value.trim()) return
  createBusy.value = true
  createError.value = ''
  try {
    await $fetch('/api/collections', {
      method: 'POST',
      body: { name: newCollectionName.value.trim() }
    })
    newCollectionName.value = ''
    isCreateModalOpen.value = false
    await refreshCollections()
  } catch (caughtError) {
    createError.value = getErrorMessage(caughtError)
  } finally {
    createBusy.value = false
  }
}

async function handleDeleteCollection(collection: CollectionItem) {
  if (!confirm(`Delete collection "${collection.name}"? Books in this collection will remain in your library.`)) return
  try {
    await $fetch(`/api/collections/${collection.id}`, { method: 'DELETE' })
    expandedCollections.value.delete(collection.id)
    delete collectionBooksMap.value[collection.id]
    await refreshCollections()
  } catch (caughtError) {
    alert(getErrorMessage(caughtError))
  }
}

function openReader(bookId: number) {
  navigateTo(`/read/${bookId}`)
}

const reviewModalBook = ref<OwnedBook | null>(null)
const reviewRating = ref<number>(5)
const reviewComment = ref<string>('')
const reviewBusy = ref(false)
const reviewError = ref('')

function openReviewModal(book: OwnedBook) {
  reviewModalBook.value = book
  reviewRating.value = book.rating || 5
  reviewComment.value = book.comment || ''
  reviewError.value = ''
}

async function handleSaveReview() {
  if (!reviewModalBook.value) return
  reviewBusy.value = true
  reviewError.value = ''
  try {
    await $fetch(`/api/books/${reviewModalBook.value.bookId}/reviews`, {
      method: 'POST',
      body: {
        rating: reviewRating.value,
        comment: reviewComment.value.trim() || undefined
      }
    })
    reviewModalBook.value = null
    await refreshLibrary()
  } catch (caughtError) {
    reviewError.value = getErrorMessage(caughtError)
  } finally {
    reviewBusy.value = false
  }
}

const addToCollectionBookId = ref<number | null>(null)
const selectedCollectionId = ref<number | ''>('')
const addCollectionBusy = ref(false)
const addCollectionError = ref('')

function openAddToCollectionModal(bookId: number) {
  addToCollectionBookId.value = bookId
  selectedCollectionId.value = ''
  addCollectionError.value = ''
}

async function handleAddBookToCollection() {
  if (!addToCollectionBookId.value || !selectedCollectionId.value) return
  addCollectionBusy.value = true
  addCollectionError.value = ''
  try {
    await $fetch(`/api/collections/${selectedCollectionId.value}/books`, {
      method: 'POST',
      body: { bookId: addToCollectionBookId.value }
    })
    const collectionId = Number(selectedCollectionId.value)
    if (collectionBooksMap.value[collectionId]) {
      const response = await $fetch<{ collection: { books: CollectionDetailBook[] } }>(`/api/collections/${collectionId}`)
      collectionBooksMap.value[collectionId] = response.collection.books
    }
    addToCollectionBookId.value = null
    await refreshCollections()
  } catch (caughtError) {
    addCollectionError.value = getErrorMessage(caughtError)
  } finally {
    addCollectionBusy.value = false
  }
}

async function handleRemoveBookFromCollection(collectionId: number, bookId: number) {
  if (!confirm('Remove this book from this collection?')) return
  try {
    await $fetch(`/api/collections/${collectionId}/books/${bookId}`, { method: 'DELETE' })
    if (collectionBooksMap.value[collectionId]) {
      collectionBooksMap.value[collectionId] = collectionBooksMap.value[collectionId].filter(book => book.bookId !== bookId)
    }
    await refreshCollections()
  } catch (caughtError) {
    alert(getErrorMessage(caughtError))
  }
}

</script>

<template>
  <PageContainer title="My Library" subtitle="Organize and read your purchased books online.">
    <template #actions>
      <Button @click="isCreateModalOpen = true">
        + Create collection
      </Button>
    </template>

    <div class="library-sections-stack">
      <AccordionPanel
          id="all-purchased"
          title="All Purchased Books"
          :description="`${ownedBooks.length} book${ownedBooks.length === 1 ? '' : 's'} available in your account`"
          :expanded="expandedCollections.has('all-purchased')"
          @toggle="toggleCollection('all-purchased')"
      >
        <div v-if="libraryPending">
          <EmptyState message="Loading your books…" />
        </div>

        <div v-else-if="ownedBooks.length" class="library-books-grid">
          <BookRowCard
              v-for="book in ownedBooks"
              :key="book.bookId"
              :book-id="book.bookId"
              :title="book.title"
              :publisher-name="book.publisherName"
              :has-cover="Boolean(book.coverPath)"
          >
            <template #meta>
              <span v-if="book.rating" class="user-rated-stars">Your rating: ★ {{ book.rating }} / 5</span>
            </template>

            <template #actions>
              <Button size="small" @click="openReader(book.bookId)">
                Read Book
              </Button>
              <Button variant="outline" size="small" @click="openReviewModal(book)">
                {{ book.rating ? 'Edit review' : 'Rate & review' }}
              </Button>
              <Button variant="outline" size="small" @click="openAddToCollectionModal(book.bookId)">
                + Collection
              </Button>
            </template>
          </BookRowCard>
        </div>

        <EmptyState
            v-else
            message="You haven't purchased any books yet."
            action-label="Browse Bookstore"
            action-to="/bookstore"
        />
      </AccordionPanel>

      <AccordionPanel
          v-for="collection in collections"
          :id="String(collection.id)"
          :key="collection.id"
          :title="collection.name"
          :description="`${collection.booksCount} book${collection.booksCount === 1 ? '' : 's'} in collection`"
          :expanded="expandedCollections.has(collection.id)"
          @toggle="toggleCollection(collection.id)"
      >
        <div class="collection-toolbar-actions">
          <span class="collection-created-date">Created on {{ formatDate(collection.createdAt) }}</span>
          <Button variant="danger" size="small" @click="handleDeleteCollection(collection)">
            Delete collection
          </Button>
        </div>

        <div v-if="loadingCollectionId === collection.id">
          <EmptyState message="Loading collection books…" />
        </div>

        <div v-else-if="collectionBooksMap[collection.id]?.length" class="library-books-grid">
          <BookRowCard
              v-for="book in collectionBooksMap[collection.id]"
              :key="book.bookId"
              :book-id="book.bookId"
              :title="book.title"
              :publisher-name="book.publisherName"
              :has-cover="Boolean(book.coverPath)"
          >
            <template #actions>
              <Button size="small" @click="openReader(book.bookId)">
                Read Book
              </Button>
              <Button
                  variant="danger"
                  size="small"
                  @click="handleRemoveBookFromCollection(collection.id, book.bookId)"
              >
                Remove
              </Button>
            </template>
          </BookRowCard>
        </div>

        <EmptyState v-else message="This collection is currently empty." />
      </AccordionPanel>
    </div>

    <Modal
        v-if="isCreateModalOpen"
        title="Create a new collection"
        @close="isCreateModalOpen = false"
    >
      <form class="modal-form-vertical" @submit.prevent="handleCreateCollection">
        <AlertNotice v-if="createError" variant="danger" :message="createError" />

        <FormField
            v-model="newCollectionName"
            label="Collection name"
            placeholder="e.g. Science Fiction, Summer Reads"
            required
        />

        <div class="modal-buttons-footer">
          <Button variant="outline" @click="isCreateModalOpen = false">Cancel</Button>
          <Button type="submit" :disabled="createBusy || !newCollectionName.trim()">
            {{ createBusy ? 'Creating…' : 'Create' }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal
        v-if="reviewModalBook"
        :title="`Review: ${reviewModalBook.title}`"
        @close="reviewModalBook = null"
    >
      <form class="modal-form-vertical" @submit.prevent="handleSaveReview">
        <AlertNotice v-if="reviewError" variant="danger" :message="reviewError" />

        <SelectField
            v-model="reviewRating"
            label="Rating (1 to 5 stars)"
            :options="[
              { value: 5, label: '★★★★★ (5 - Excellent)' },
              { value: 4, label: '★★★★☆ (4 - Very good)' },
              { value: 3, label: '★★★☆☆ (3 - Average)' },
              { value: 2, label: '★★☆☆☆ (2 - Below average)' },
              { value: 1, label: '★☆☆☆☆ (1 - Poor)' }
            ]"
        />

        <FormField
            v-model="reviewComment"
            label="Your review (optional)"
            multiline
            :rows="4"
            placeholder="Share your thoughts on this book..."
        />

        <div class="modal-buttons-footer">
          <Button variant="outline" @click="reviewModalBook = null">Cancel</Button>
          <Button type="submit" :disabled="reviewBusy">
            {{ reviewBusy ? 'Saving…' : 'Save review' }}
          </Button>
        </div>
      </form>
    </Modal>

    <Modal
        v-if="addToCollectionBookId"
        title="Add to collection"
        @close="addToCollectionBookId = null"
    >
      <form class="modal-form-vertical" @submit.prevent="handleAddBookToCollection">
        <AlertNotice v-if="addCollectionError" variant="danger" :message="addCollectionError" />

        <SelectField
            v-model="selectedCollectionId"
            label="Select target collection"
            placeholder="Choose collection…"
            :options="collections.map(collection => ({ value: collection.id, label: `${collection.name} (${collection.booksCount} books)` }))"
            required
        />

        <div class="modal-buttons-footer">
          <Button variant="outline" @click="addToCollectionBookId = null">Cancel</Button>
          <Button type="submit" :disabled="addCollectionBusy || !selectedCollectionId">
            {{ addCollectionBusy ? 'Adding…' : 'Add to collection' }}
          </Button>
        </div>
      </form>
    </Modal>
  </PageContainer>
</template>

<style scoped>

.library-sections-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.library-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.user-rated-stars {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-status-warning);
}

.collection-toolbar-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.collection-created-date {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.modal-form-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-buttons-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

</style>