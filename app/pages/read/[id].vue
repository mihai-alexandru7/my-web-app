<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const bookId = Number(route.params.id)
const isSample = computed(() => route.query.sample === 'true')

const { loggedIn } = useUserSession()

// Doar dacă se citește cartea întreagă este obligatorie autentificarea
if (!isSample.value && !loggedIn.value) {
  await navigateTo(`/account/sign-in?redirect=/read/${bookId}`)
}

// Preluare detalii carte (endpoint public)
const { data: bookData } = await useFetch<any>(`/api/books/${bookId}`)

// Preluare progres doar pentru cartea cumpărată (mostra începe de la pagina 1)
const { data: progressData } = isSample.value
    ? { data: ref(null) }
    : await useFetch<any>(`/api/library/${bookId}/progress`)

const bookTitle = computed(() => bookData.value?.book?.title || 'eBook Reader')

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const zoomScale = ref(1.15)
const isDocLoading = ref(true)
const isRendering = ref(false)
const errorMessage = ref('')
const saveStatus = ref('')

const activeFormat = ref<'pdf' | 'epub'>('pdf')
const epubChapters = ref<string[]>([])
const currentEpubContent = computed(() => epubChapters.value[currentPage.value - 1] || '')

const isDocLoaded = ref(false)
let pdfDoc: any = null

function loadPdfJsScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(lib)
    }
    script.onerror = () => reject(new Error('Nu s-a putut inițializa PDF.js.'))
    document.head.appendChild(script)
  })
}

function loadJsZipScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).JSZip) {
      resolve((window as any).JSZip)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    script.onload = () => resolve((window as any).JSZip)
    script.onerror = () => reject(new Error('Nu s-a putut inițializa JSZip.'))
    document.head.appendChild(script)
  })
}

async function renderPdfPage(pageNumber: number) {
  if (!pdfDoc || isRendering.value) return
  isRendering.value = true

  try {
    const page = await pdfDoc.getPage(pageNumber)
    const canvas = canvasRef.value
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const viewport = page.getViewport({ scale: zoomScale.value })

    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    await page.render({ canvasContext: ctx, viewport }).promise
    currentPage.value = pageNumber
  } catch (err: any) {
    console.error('Render page error:', err)
  } finally {
    isRendering.value = false
  }
}

async function loadEpubDocument(uint8Data: Uint8Array) {
  const JSZip = await loadJsZipScript()
  const zip = await JSZip.loadAsync(uint8Data)

  const htmlFiles: string[] = []
  zip.forEach((path: string) => {
    if (/\.(xhtml|html|htm)$/i.test(path) && !path.includes('toc')) {
      htmlFiles.push(path)
    }
  })
  htmlFiles.sort()

  if (!htmlFiles.length) {
    throw new Error('Fișierul EPUB nu conține capitole citibile.')
  }

  const chapters: string[] = []
  for (const file of htmlFiles) {
    const text = await zip.file(file)?.async('text')
    if (text) {
      const match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      chapters.push(match ? match[1] : text)
    }
  }

  epubChapters.value = chapters
  totalPages.value = chapters.length
  activeFormat.value = 'epub'
  isDocLoaded.value = true

  const saved = parseInt(progressData.value?.lastPosition || '1', 10)
  currentPage.value = !isNaN(saved) && saved >= 1 && saved <= totalPages.value ? saved : 1
}

function goToPrev() {
  if (currentPage.value > 1) {
    if (activeFormat.value === 'pdf') {
      renderPdfPage(currentPage.value - 1)
    } else {
      currentPage.value--
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function goToNext() {
  if (currentPage.value < totalPages.value) {
    if (activeFormat.value === 'pdf') {
      renderPdfPage(currentPage.value + 1)
    } else {
      currentPage.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function onPageInput(event: Event) {
  const target = event.target as HTMLInputElement
  const num = parseInt(target.value, 10)
  if (!isNaN(num) && num >= 1 && num <= totalPages.value) {
    if (activeFormat.value === 'pdf') {
      renderPdfPage(num)
    } else {
      currentPage.value = num
    }
  } else {
    target.value = String(currentPage.value)
  }
}

function zoomIn() {
  if (activeFormat.value === 'pdf' && zoomScale.value < 2.5) {
    zoomScale.value = parseFloat((zoomScale.value + 0.15).toFixed(2))
    renderPdfPage(currentPage.value)
  } else if (activeFormat.value === 'epub' && zoomScale.value < 2.0) {
    zoomScale.value = parseFloat((zoomScale.value + 0.1).toFixed(2))
  }
}

function zoomOut() {
  if (activeFormat.value === 'pdf' && zoomScale.value > 0.6) {
    zoomScale.value = parseFloat((zoomScale.value - 0.15).toFixed(2))
    renderPdfPage(currentPage.value)
  } else if (activeFormat.value === 'epub' && zoomScale.value > 0.8) {
    zoomScale.value = parseFloat((zoomScale.value - 0.1).toFixed(2))
  }
}

async function saveProgress() {
  if (isSample.value) return
  saveStatus.value = 'Saving…'
  try {
    await $fetch(`/api/library/${bookId}/progress`, {
      method: 'PATCH',
      body: { lastPosition: String(currentPage.value) }
    })
    saveStatus.value = 'Saved ✓'
    setTimeout(() => {
      saveStatus.value = ''
    }, 2500)
  } catch {
    saveStatus.value = 'Error saving'
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement) return
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    goToNext()
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    goToPrev()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  errorMessage.value = ''
  isDocLoading.value = true

  try {
    // Sursa fișierului: eșantion sau cartea completă
    const fileUrl = isSample.value
        ? `/api/books/${bookId}/sample`
        : `/api/books/${bookId}/file`

    const response = await fetch(fileUrl, {
      credentials: 'include'
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => null)
      throw new Error(errJson?.message || `Eroare ${response.status}: Nu s-a putut deschide documentul.`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)

    const isPdf = uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46 // %PDF
    const isZip = uint8[0] === 0x50 && uint8[1] === 0x4B // PK (EPUB / ZIP)

    if (isZip) {
      await loadEpubDocument(uint8)
    } else if (isPdf) {
      activeFormat.value = 'pdf'
      const pdfjsLib = await loadPdfJsScript()

      const loadingTask = pdfjsLib.getDocument({
        data: uint8,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      })

      pdfDoc = await loadingTask.promise
      totalPages.value = pdfDoc.numPages

      const saved = isSample.value ? 1 : parseInt(progressData.value?.lastPosition || '1', 10)
      const startPage = !isNaN(saved) && saved >= 1 && saved <= totalPages.value ? saved : 1

      await renderPdfPage(startPage)
      isDocLoaded.value = true
    } else {
      throw new Error('Formatul documentului nu este recunoscut ca PDF sau EPUB.')
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Eroare la deschiderea cărții.'
  } finally {
    isDocLoading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

useSeoMeta({
  title: computed(() => isSample.value ? `[Sample] ${bookTitle.value}` : `Reading: ${bookTitle.value}`)
})
</script>

<template>
  <div class="reader-shell">
    <!-- Meniu cititor -->
    <header class="reader-toolbar">
      <div class="toolbar-group left-group">
        <NuxtLink :to="isSample ? `/bookstore/${bookId}` : '/reader/library'" class="back-link">
          {{ isSample ? '← Back to Bookstore' : '← Back to Library' }}
        </NuxtLink>
        <h1 class="book-title" :title="bookTitle">{{ bookTitle }}</h1>
        <span v-if="isSample" class="sample-tag">FREE SAMPLE</span>
        <span v-if="isDocLoaded" class="format-badge">{{ activeFormat.toUpperCase() }}</span>
      </div>

      <!-- Paginare -->
      <div v-if="isDocLoaded && !isDocLoading" class="toolbar-group center-group">
        <button
            type="button"
            class="control-btn"
            :disabled="currentPage <= 1 || isRendering"
            aria-label="Previous"
            @click="goToPrev"
        >
          ❮
        </button>

        <div class="page-indicator">
          <span>{{ activeFormat === 'pdf' ? 'Page' : 'Chapter' }}</span>
          <input
              type="text"
              class="page-input"
              :value="currentPage"
              :disabled="isRendering"
              @change="onPageInput"
              @keydown.enter="onPageInput"
          />
          <span>of {{ totalPages }}</span>
        </div>

        <button
            type="button"
            class="control-btn"
            :disabled="currentPage >= totalPages || isRendering"
            aria-label="Next"
            @click="goToNext"
        >
          ❯
        </button>
      </div>

      <!-- Zoom & Bookmark / Buy Action -->
      <div v-if="isDocLoaded && !isDocLoading" class="toolbar-group right-group">
        <div class="zoom-controls">
          <button type="button" class="tool-btn" title="Zoom out" @click="zoomOut">−</button>
          <span class="zoom-level">{{ Math.round(zoomScale * 100) }}%</span>
          <button type="button" class="tool-btn" title="Zoom in" @click="zoomIn">+</button>
        </div>

        <Button v-if="!isSample" size="small" @click="saveProgress">
          {{ saveStatus || 'Save bookmark' }}
        </Button>
        <NuxtLink v-else :to="`/bookstore/${bookId}`">
          <Button size="small">
            Buy Full Book
          </Button>
        </NuxtLink>
      </div>
    </header>

    <!-- Suprafața de lectură -->
    <main class="reader-viewport">
      <div v-if="errorMessage && !isDocLoaded" class="reader-card error-card">
        <h2>Cannot open document</h2>
        <p>{{ errorMessage }}</p>
        <NuxtLink :to="isSample ? `/bookstore/${bookId}` : '/reader/library'" class="error-action-link">
          {{ isSample ? 'Return to Bookstore' : 'Return to Library' }}
        </NuxtLink>
      </div>

      <div v-else-if="isDocLoading" class="reader-card loading-card">
        <div class="spinner"></div>
        <p>{{ isSample ? 'Loading free sample…' : 'Opening document…' }}</p>
      </div>

      <!-- Vizualizare PDF -->
      <div
          v-show="activeFormat === 'pdf' && isDocLoaded"
          class="canvas-page-container"
          :class="{ 'rendering': isRendering }"
      >
        <canvas ref="canvasRef" class="pdf-canvas"></canvas>
      </div>

      <!-- Vizualizare EPUB -->
      <div
          v-if="activeFormat === 'epub' && isDocLoaded"
          class="epub-reading-container"
          :style="{ fontSize: `${zoomScale * 1.05}rem` }"
      >
        <div class="epub-html-content" v-html="currentEpubContent"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.reader-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--color-background-page);
  font-family: var(--font-family-serif);
  overflow: hidden;
}

.reader-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 24px;
  background: var(--color-background-surface);
  border-bottom: 1.5px solid var(--color-border-main);
  box-shadow: var(--box-shadow-card);
  z-index: 10;
  box-sizing: border-box;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.left-group {
  flex: 1;
  min-width: 0;
}

.back-link {
  color: var(--color-action-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
}

.back-link:hover {
  text-decoration: underline;
}

.book-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 28vw;
}

.sample-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  background: var(--color-status-warning-background);
  border: 1px solid var(--color-status-warning);
  border-radius: var(--border-radius-small);
  color: var(--color-status-warning);
  letter-spacing: 0.05em;
}

.format-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  background: var(--color-background-surface-alternate);
  border: 1px solid var(--color-border-main);
  border-radius: var(--border-radius-small);
  color: var(--color-action-primary);
}

.center-group {
  justify-content: center;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-small);
  border: 1.5px solid var(--color-border-field);
  background: var(--color-background-field);
  color: var(--color-action-primary);
  font-weight: 700;
  cursor: pointer;
}

.control-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.page-input {
  width: 46px;
  padding: 4px;
  border: 1.5px solid var(--color-border-field);
  border-radius: var(--border-radius-small);
  background: var(--color-background-field);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.right-group {
  justify-content: flex-end;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-background-surface-alternate);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--border-radius-small);
  padding: 2px 6px;
}

.tool-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-action-primary);
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.zoom-level {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  min-width: 40px;
  text-align: center;
}

.reader-viewport {
  flex: 1;
  width: 100%;
  height: calc(100vh - 65px);
  background: #ece7d5;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 16px;
  box-sizing: border-box;
}

.canvas-page-container {
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  line-height: 0;
  transition: opacity 0.2s;
  margin: auto;
}

.canvas-page-container.rendering {
  opacity: 0.65;
}

.pdf-canvas {
  display: block;
}

.epub-reading-container {
  max-width: 800px;
  width: 100%;
  background: #fffdf7;
  padding: 50px 60px;
  border-radius: var(--border-radius-large);
  border: 1px solid var(--color-border-main);
  box-shadow: var(--box-shadow-elevated);
  line-height: 1.75;
  color: #2b2b2b;
  margin: auto;
}

.epub-html-content :deep(p) {
  margin-bottom: 1.2em;
  text-align: justify;
}

.reader-card {
  margin: auto;
  padding: 36px 48px;
  text-align: center;
  background: var(--color-background-surface);
  border: 1.5px solid var(--color-border-main);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-elevated);
}

.error-card h2 {
  color: var(--color-status-danger);
  margin-top: 0;
}

.error-action-link {
  display: inline-block;
  margin-top: 14px;
  color: var(--color-action-primary);
  text-decoration: underline;
  font-weight: 600;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3.5px solid var(--color-border-main);
  border-top-color: var(--color-action-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>