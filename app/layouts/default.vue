<script setup lang="ts">

const route = useRoute()
const { user, clear } = useUserSession()

const roleLinks: Record<string, { label: string; to: string }[]> = {
  reader: [
    { label: 'My Library', to: '/reader/library' },
    { label: 'My Wishlist', to: '/reader/wishlist' },
    { label: 'My Cart', to: '/reader/cart' }
  ],
  publisher: [
    { label: 'My Books', to: '/publisher#books' },
    { label: 'My Sales', to: '/publisher#sales-report' }
  ],
  administrator: [
    { label: 'Administration', to: '/administration' }
  ]
}

const menuLinks = computed(() => [
  { label: 'Home', to: '/' },
  { label: 'Bookstore', to: '/bookstore' },
  ...(roleLinks[user.value?.role as string] ?? [])
])

const accountLinks = computed(() => {
  if (user.value) {
    return [{ label: 'My Account', to: '/account' }]
  }

  const currentPath = route.fullPath.startsWith('/account') ? '/' : route.fullPath
  const redirectQuery = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''

  return [
    { label: 'Sign In', to: `/account/sign-in${redirectQuery}` },
    { label: 'Sign Up', to: `/account/sign-up${redirectQuery}` }
  ]
})

const displayName = computed(() => {
  if (user.value?.role === 'publisher') {
    return (user.value as any)?.publisherName || [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ') || 'Publisher'
  }
  return [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ')
})

const openPanel = ref<'menu' | 'account' | null>(null)
const isMenuExpanded = computed(() => openPanel.value === 'menu')
const isAccountExpanded = computed(() => openPanel.value === 'account')

const toggleMenu = () => {
  openPanel.value = isMenuExpanded.value ? null : 'menu'
}

const toggleAccount = () => {
  openPanel.value = isAccountExpanded.value ? null : 'account'
}

const closeAll = () => {
  openPanel.value = null
}

watch(() => route.fullPath, closeAll)

const menuContainer = ref<HTMLElement | null>(null)
const accountContainer = ref<HTMLElement | null>(null)

const handlePointerDown = (event: PointerEvent) => {
  const target = event.target as Node
  const clickedInside = [menuContainer.value, accountContainer.value].some((element) =>
      element?.contains(target)
  )
  if (!clickedInside) closeAll()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && openPanel.value) {
    closeAll()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
})

const signOutError = ref('')

const handleSignOut = async () => {
  signOutError.value = ''
  try {
    await $fetch('/api/account/sign-out', { method: 'POST' })
    await clear()
    closeAll()
    await navigateTo('/')
  } catch {
    signOutError.value = 'Could not sign out. Please try again.'
  }
}

</script>

<template>
  <div class="application-layout-container">
    <div ref="menuContainer" class="navigation-menu-trigger-container">
      <NavigationTriggerButton variant="menu" :open="isMenuExpanded" @click="toggleMenu" />

      <NavigationPanel id="main-menu" side="left" :open="isMenuExpanded">
        <nav aria-label="Main">
          <ul class="navigation-link-list">
            <li v-for="link in menuLinks" :key="link.to">
              <NavigationItem :to="link.to">
                {{ link.label }}
              </NavigationItem>
            </li>
          </ul>
        </nav>
      </NavigationPanel>
    </div>

    <div ref="accountContainer" class="navigation-account-trigger-container">
      <NavigationTriggerButton variant="account" :open="isAccountExpanded" @click="toggleAccount" />

      <NavigationPanel id="account-menu" side="right" :open="isAccountExpanded">
        <ul class="navigation-link-list">
          <li v-if="user">
            <NavigationUserInfo :display-name="displayName" :email="user.email" />
          </li>
          <li v-for="link in accountLinks" :key="link.to">
            <NavigationItem :to="link.to">
              {{ link.label }}
            </NavigationItem>
          </li>
          <li v-if="user">
            <NavigationItem danger @click="handleSignOut">
              Sign Out
            </NavigationItem>
          </li>
          <li v-if="signOutError" class="sign-out-error-notice" role="alert">{{ signOutError }}</li>
        </ul>
      </NavigationPanel>
    </div>

    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>

.application-layout-container {
  min-height: 100vh;
  font-family: var(--font-family-serif);
}

.navigation-menu-trigger-container {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 1000;
}

.navigation-account-trigger-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
}

.navigation-link-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sign-out-error-notice {
  padding: 4px 6px;
  color: var(--color-status-danger);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

</style>