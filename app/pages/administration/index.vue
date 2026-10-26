<script setup lang="ts">

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
      if (typeof newSection === 'string' && sections.some(section => section.id === newSection)) {
        expandedSections.value.add(newSection)
        nextTick(() => {
          const targetElement = document.getElementById(`section-${newSection}`)
          targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    },
    { immediate: true }
)

</script>

<template>
  <div class="administration-page-wrapper">
    <div class="administration-page-container">
      <header class="administration-page-header">
        <h1 class="administration-heading-title">Administration</h1>
      </header>

      <div class="administration-sections-stack">
        <AccordionPanel
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            :title="section.title"
            :description="section.description"
            :expanded="isExpanded(section.id)"
            @toggle="toggleSection(section.id)"
        >
          <AdministrationBooks v-if="section.id === 'books'" />
          <AdministrationGenres v-else-if="section.id === 'genres'" />
          <AdministrationCategories v-else-if="section.id === 'categories'" />
          <AdministrationLanguages v-else-if="section.id === 'languages'" />
          <AdministrationUsers v-else-if="section.id === 'users'" />
          <AdministrationReviews v-else-if="section.id === 'reviews'" />
        </AccordionPanel>
      </div>
    </div>
  </div>
</template>

<style scoped>

.administration-page-wrapper {
  min-height: 100vh;
  background: var(--color-background-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-serif);
  padding: 100px 24px 60px;
  box-sizing: border-box;
}

.administration-page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.administration-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border-main);
}

.administration-heading-title {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 400;
  color: var(--color-action-primary);
}

.administration-sections-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

</style>