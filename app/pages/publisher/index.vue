<script setup lang="ts">

definePageMeta({ middleware: 'publisher' })
useHead({ title: 'Publisher Dashboard' })

const {
  books, pending, isModalOpen, selectedBook,
  openUpload, openEdit, withdraw, closeModal, onSaved,
} = usePublisherBooks()

</script>

<template>
  <main class="publisher-page">
    <div class="publisher-page-container">
      <header class="publisher-page-header">
        <h1 class="publisher-page-title">Manage your catalogue and keep track of your sales.</h1>
      </header>

      <SectionCard id="books" title="Published books">
        <div class="publisher-toolbar">
          <p class="publisher-toolbar-summary">
            {{ books.length }} {{ books.length === 1 ? 'book' : 'books' }} in total
          </p>
          <Button @click="openUpload">
            + Upload book
          </Button>
        </div>

        <PublisherBooksTable :books="books" :pending="pending" @edit="openEdit" @withdraw="withdraw" />
      </SectionCard>

      <SectionCard id="sales-report" title="Sales report">
        <PublisherSalesReport />
      </SectionCard>
    </div>

    <Modal
        v-if="isModalOpen"
        :title="selectedBook ? 'Edit book details' : 'Upload a new book'"
        @close="closeModal"
    >
      <PublisherBookForm :book="selectedBook" @close="closeModal" @saved="onSaved" />
    </Modal>
  </main>
</template>

<style scoped>

.publisher-page {
  min-height: 100vh;
  padding: 100px 0 60px;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.publisher-page-container {
  width: 82%;
  background: var(--color-background-surface-alternate);
  border: 1px solid var(--color-border-group);
  border-radius: var(--border-radius-extra-large);
  padding: 36px;
  box-shadow: var(--box-shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

.publisher-page-header {
  padding-bottom: 20px;
  border-bottom: 3px double var(--color-border-group);
}

.publisher-page-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 400;
  line-height: 1.2;
  color: var(--color-action-primary);
}

.publisher-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.publisher-toolbar-summary {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .publisher-page-container {
    width: 95%;
    padding: 20px;
  }
}

</style>