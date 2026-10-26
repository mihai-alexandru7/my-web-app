<script setup lang="ts">

import { formatPrice } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errors'

definePageMeta({ middleware: 'reader' })
useSeoMeta({ title: 'My Cart' })

const { loggedIn } = useUserSession()

if (!loggedIn.value) {
  await navigateTo('/account/sign-in?redirect=/reader/cart')
}

interface CartItem {
  bookId: number
  title: string
  price: string
  coverPath: string | null
  status: string
  publisherName: string
  addedAt: string
}

interface CartResponse {
  items: CartItem[]
  count: number
  total: string
}

const { data, refresh, pending } = await useFetch<CartResponse>('/api/cart')
const cart = computed(() => data.value)

const busy = ref(false)
const errorMessage = ref('')
const checkoutSuccess = ref<{ orderId: number; totalAmount: string; itemsCount: number } | null>(null)

async function removeItem(bookId: number) {
  busy.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/cart/${bookId}`, { method: 'DELETE' })
    await refresh()
  } catch (caughtError) {
    errorMessage.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

async function clearCart() {
  if (!confirm('Clear all items from your cart?')) return
  busy.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/cart', { method: 'DELETE' })
    await refresh()
  } catch (caughtError) {
    errorMessage.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

async function handleCheckout() {
  busy.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<{ order: { orderId: number; totalAmount: string; itemsCount: number } }>('/api/cart/checkout', {
      method: 'POST',
      body: { paymentMethod: 'card' }
    })
    checkoutSuccess.value = response.order
    await refresh()
  } catch (caughtError) {
    errorMessage.value = getErrorMessage(caughtError)
  } finally {
    busy.value = false
  }
}

</script>

<template>
  <PageContainer title="My Cart" subtitle="Review selected books and proceed to purchase.">
    <div v-if="checkoutSuccess" class="checkout-success-confirmation">
      <h2 class="order-confirmed-heading">✓ Order Confirmed!</h2>
      <p class="order-details-summary">
        Thank you for your purchase! <strong>{{ checkoutSuccess.itemsCount }} books</strong> have been added to your library.
      </p>
      <span class="order-total-amount">Total paid: {{ formatPrice(checkoutSuccess.totalAmount) }}</span>
      <div class="checkout-buttons-group">
        <NuxtLink to="/reader/library" class="navigate-library-button">Go to My Library to Read</NuxtLink>
        <NuxtLink to="/bookstore" class="continue-store-link">Continue Shopping</NuxtLink>
      </div>
    </div>

    <template v-else>
      <AlertNotice v-if="errorMessage" variant="danger" :message="errorMessage" />

      <div v-if="pending">
        <EmptyState message="Loading cart items…" />
      </div>

      <div v-else-if="cart?.items.length" class="cart-layout-columns">
        <div class="cart-items-column">
          <div class="cart-toolbar-row">
            <span class="items-count-indicator">{{ cart.count }} book{{ cart.count === 1 ? '' : 's' }} in cart</span>
            <Button variant="outline" size="small" :disabled="busy" @click="clearCart">
              Clear cart
            </Button>
          </div>

          <BookRowCard
              v-for="item in cart.items"
              :key="item.bookId"
              :book-id="item.bookId"
              :title="item.title"
              :publisher-name="item.publisherName"
              :cover-path="item.coverPath"
              :price="item.price"
          >
            <template #actions>
              <Button variant="danger" size="small" :disabled="busy" @click="removeItem(item.bookId)">
                Remove
              </Button>
            </template>
          </BookRowCard>
        </div>

        <aside class="cart-summary-sidebar">
          <h2 class="summary-section-title">Order Summary</h2>

          <div class="summary-data-line">
            <span>Items</span>
            <span>{{ cart.count }}</span>
          </div>

          <div class="summary-total-line">
            <span>Total Amount</span>
            <span class="total-price-text">{{ formatPrice(cart.total) }}</span>
          </div>

          <Button
              size="medium"
              class="purchase-submit-button"
              :disabled="busy || cart.items.length === 0"
              @click="handleCheckout"
          >
            {{ busy ? 'Processing purchase…' : 'Complete Purchase' }}
          </Button>
        </aside>
      </div>

      <EmptyState
          v-else
          message="Your shopping cart is empty."
          action-label="Browse Bookstore"
          action-to="/bookstore"
      />
    </template>
  </PageContainer>
</template>

<style scoped>

.cart-layout-columns {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

.cart-items-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.items-count-indicator {
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.cart-summary-sidebar {
  background: var(--color-background-surface-section);
  border: 1.5px solid var(--color-border-subtle);
  border-radius: var(--border-radius-large);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-section-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-action-primary);
  padding-bottom: 10px;
  border-bottom: 1.5px solid var(--color-action-primary);
}

.summary-data-line {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.summary-total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.15rem;
  font-weight: 700;
  border-top: 1px solid var(--color-border-subtle);
  padding-top: 12px;
  margin-top: 4px;
}

.total-price-text {
  font-size: 1.5rem;
  color: var(--color-action-primary);
}

.purchase-submit-button {
  width: 100%;
  margin-top: 8px;
}

.checkout-success-confirmation {
  text-align: center;
  padding: 40px 20px;
  background: var(--color-status-success-background);
  border: 1.5px solid var(--color-status-success);
  border-radius: var(--border-radius-large);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.order-confirmed-heading {
  margin: 0;
  color: var(--color-status-success);
  font-size: 2rem;
}

.order-details-summary {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-text-primary);
}

.order-total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-action-primary);
}

.checkout-buttons-group {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.navigate-library-button {
  padding: 10px 22px;
  background: var(--color-action-primary);
  color: var(--color-action-on-primary);
  border-radius: var(--border-radius-small);
  text-decoration: none;
  font-weight: 600;
}

.continue-store-link {
  padding: 10px 22px;
  color: var(--color-action-primary);
  text-decoration: underline;
  font-weight: 600;
}

@media (max-width: 900px) {
  .cart-layout-columns {
    grid-template-columns: 1fr;
  }
}

</style>