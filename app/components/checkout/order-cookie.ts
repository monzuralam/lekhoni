import type { OrderSummary } from '@/lib/cart-types'

// Guests can't read an order back from WooGraphQL ("Not authorized to access
// this order"), so /api/checkout keeps the summary it got from the `checkout`
// mutation in a short-lived httpOnly cookie, read by /order-received.
export const ORDER_COOKIE = 'lk-order'
export const ORDER_COOKIE_PATH = '/order-received'
export const ORDER_COOKIE_MAX_AGE = 60 * 60 // 1 hour

const MAX_LENGTH = 3800 // stay under the ~4KB per-cookie browser limit

const encode = (order: OrderSummary) => Buffer.from(JSON.stringify(order)).toString('base64url')

export function encodeOrder (order: OrderSummary) {
  let value = encode(order)
  if (value.length <= MAX_LENGTH) return value
  // Too big: drop images first, then trailing items
  let slim: OrderSummary = { ...order, items: order.items.map(item => ({ ...item, image: null })) }
  value = encode(slim)
  while (value.length > MAX_LENGTH && slim.items.length > 1) {
    slim = { ...slim, items: slim.items.slice(0, -1), moreItems: slim.moreItems + 1 }
    value = encode(slim)
  }
  return value
}

export function decodeOrder (value: string | undefined): OrderSummary | null {
  if (!value) return null
  try {
    const order = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    return order && typeof order.id === 'number' && Array.isArray(order.items) ? order : null
  } catch {
    return null
  }
}
