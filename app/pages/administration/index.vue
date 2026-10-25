<script setup lang="ts">

import '@/assets/css/administration.css'

definePageMeta({ middleware: 'administration' })
useHead({ title: 'Administration' })

const route = useRoute()

interface AdministrationSection {
  id: string
  title: string
  description: string
}

const sections: AdministrationSection[] = [
  {
    id: 'books',
    title: 'Book management',
    description: 'Review submitted books from publishers, approve them for store listing, reject with a specified reason, or withdraw them from sale.'
  },
  {
    id: 'genres',
    title: 'Genres management',
    description: 'Create new literary genres, update existing genre names, or delete unused genres from the catalog.'
  },
  {
    id: 'categories',
    title: 'Category management',
    description: 'Organize catalog classifications by creating, updating, or deleting book categories.'
  },
  {
    id: 'languages',
    title: 'Language management',
    description: 'Manage supported publication languages by adding two-letter language codes, updating names, or removing languages.'
  },
  {
    id: 'users',
    title: 'User management',
    description: 'View registered users across all roles, inspect profiles, search by name or email, and toggle account activation status.'
  },
  {
    id: 'reviews',
    title: 'Review management',
    description: 'Monitor reader reviews for purchased books and remove inappropriate or offensive content.'
  }
]

const expandedSections = ref<Set<string>>(new Set(['books']))

function isExpanded(id: string): boolean {
  return expandedSections.value.has(id)
}

function toggleSection(id: string) {
  if (expandedSections.value.has(id)) {
    expandedSections.value.delete(id)
  } else {
    expandedSections.value.add(id)
  }
}

watch(
    () => route.query.section,
    (newSection) => {
      if (typeof newSection === 'string' && sections.some(s => s.id === newSection)) {
        expandedSections.value.add(newSection)
        nextTick(() => {
          const el = document.getElementById(`section-${newSection}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    },
    { immediate: true }
)

</script>

<template>
  <div class="administration-page-wrapper">
    <div class="administration-page-container">
      <header class="administration-page-container-header">
        <div class="administration-page-container-header-title">
          <h1>Administration</h1>
        </div>
      </header>

      <div class="administration-sections-stack">
        <AdministrationPanel
            v-for="sec in sections"
            :id="sec.id"
            :key="sec.id"
            :title="sec.title"
            :description="sec.description"
            :expanded="isExpanded(sec.id)"
            @toggle="toggleSection(sec.id)"
        >
          <AdministrationBooks v-if="sec.id === 'books'" />
          <AdministrationGenres v-else-if="sec.id === 'genres'" />
          <AdministrationCategories v-else-if="sec.id === 'categories'" />
          <AdministrationLanguages v-else-if="sec.id === 'languages'" />
          <AdministrationUsers v-else-if="sec.id === 'users'" />
          <AdministrationReviews v-else-if="sec.id === 'reviews'" />
        </AdministrationPanel>
      </div>
    </div>
  </div>
</template>

<style scoped>

.administration-page-container-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--administration-border);
}

.administration-page-container-header-title h1 {
  margin: 0 0 6px 0;
  font-size: 2.1rem;
  font-weight: 400;
  color: var(--administration-primary);
}

.administration-sections-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

</style>