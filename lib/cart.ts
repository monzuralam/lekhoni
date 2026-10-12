import { cookies } from 'next/headers'
import { formatPrice } from '@/lib/products'
import { EMPTY_CART, type Cart } from '@/lib/cart-types'
import { getAuthToken } from '@/lib/auth'

// WooGraphQL keeps the cart in a session identified by the
// `woocommerce-session` token. The browser never sees it: we store it in an
// httpOnly cookie and attach it to every cart request made from the server.
const SESSION_COOKIE = 'woo-session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // WooGraphQL's default session length

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

async function post<T> (query: string, variables: object, token?: string) {
  const url = process.env.WP_GRAPHQL_URL
  if (!url) throw new Error('WP_GRAPHQL_URL is not defined')
  // Signed-in customers: the cart (and checkout orders) belong to their account.
  // WooGraphQL carries a guest cart over and issues a new session token.
  const authToken = await getAuthToken({ persist: true })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'woocommerce-session': `Session ${token}` } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  })
  const json: GraphQLResponse<T> = await res.json()
  return { json, token: res.headers.get('woocommerce-session') }
}

export async function cartQuery<T> (query: string, variables: object = {}) {
  const store = await cookies()
  const saved = store.get(SESSION_COOKIE)?.value

  let { json, token } = await post<T>(query, variables, saved)

  // Expired or invalid session: start a fresh cart instead of failing
  if (saved && json.errors?.some(error => /token/i.test(error.message))) {
    store.delete(SESSION_COOKIE)
    ;({ json, token } = await post<T>(query, variables))
  }

  if (token && token !== saved) {
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE
    })
  }

  return json
}

// ---------------------------------------------------------------------------
// Cart fields + mapping shared by /api/cart, /api/cart/coupon,
// /api/cart/shipping and /api/checkout, so every response has the same shape.

export const CART_FIELDS = `
  subtotal
  discountTotal
  rawDiscount: discountTotal(format: RAW)
  shippingTotal
  total
  needsShippingAddress
  chosenShippingMethods
  appliedCoupons {
    code
    discountAmount
  }
  availableShippingMethods {
    rates {
      id
      label
      cost
    }
  }
  contents {
    itemCount
    nodes {
      key
      quantity
      total
      subtotal
      product {
        node {
          databaseId
          name
          uri
          image {
            sourceUrl
          }
          ... on SimpleProduct {
            price
          }
          ... on VariableProduct {
            price
          }
        }
      }
      variation {
        node {
          price
        }
        attributes {
          label
          value
        }
      }
    }
  }
`

export type RawCart = {
  subtotal: string | null
  discountTotal: string | null
  rawDiscount: string | null
  shippingTotal: string | null
  total: string | null
  needsShippingAddress: boolean | null
  chosenShippingMethods: (string | null)[] | null
  appliedCoupons: { code: string; discountAmount: string | null }[] | null
  availableShippingMethods: {
    rates: { id: string; label: string | null; cost: string | null }[] | null
  }[] | null
  contents: {
    itemCount: number
    nodes: {
      key: string
      quantity: number
      total: string | null
      subtotal: string | null
      product: {
        node: {
          databaseId: number
          name: string
          uri: string
          image: { sourceUrl: string } | null
          price?: string | null
        }
      } | null
      variation: {
        node: { price: string | null } | null
        attributes: { label: string; value: string }[] | null
      } | null
    }[]
  } | null
} | null

const amount = (value: string | null | undefined) =>
  Number(String(value ?? '').replace(/&#?\w+;/g, '').replace(/[^\d.]/g, '')) || 0

// Shipping rate costs come back unformatted ("5.00"): borrow the currency
// symbol from a formatted cart total
function rateCost (cost: string | null, sample: string | null) {
  if (cost && /[^\d.,\s]/.test(cost)) return formatPrice(cost)
  const symbol = (sample ?? '').match(/^[^\d]*/)?.[0] ?? ''
  return formatPrice(`${symbol}${Number(cost ?? 0).toFixed(2)}`)
}

export function toCart (cart: RawCart): Cart {
  if (!cart) return EMPTY_CART
  return {
    count: cart.contents?.itemCount ?? 0,
    subtotal: formatPrice(cart.subtotal),
    items: (cart.contents?.nodes ?? []).map(item => ({
      key: item.key,
      productId: item.product?.node?.databaseId ?? 0,
      name: item.product?.node?.name ?? '',
      uri: item.product?.node?.uri ?? '#',
      image: item.product?.node?.image?.sourceUrl ?? null,
      variant:
        item.variation?.attributes?.map(a => `${a.label}: ${a.value}`).join(', ') || null,
      quantity: item.quantity,
      total: formatPrice(item.total),
      price: formatPrice(item.variation?.node?.price ?? item.product?.node?.price),
      subtotal: formatPrice(item.subtotal)
    })),
    discountTotal: formatPrice(cart.discountTotal),
    hasDiscount: amount(cart.rawDiscount) > 0,
    shippingTotal: formatPrice(cart.shippingTotal),
    total: formatPrice(cart.total),
    coupons: (cart.appliedCoupons ?? []).map(coupon => ({
      code: coupon.code,
      amount: formatPrice(coupon.discountAmount)
    })),
    shippingPackages: (cart.availableShippingMethods ?? []).map(pkg =>
      (pkg.rates ?? []).map(rate => ({
        id: rate.id,
        label: rate.label ?? rate.id,
        cost: rateCost(rate.cost, cart.subtotal),
        free: amount(rate.cost) === 0
      }))
    ),
    chosenShipping: (cart.chosenShippingMethods ?? []).filter((id): id is string => !!id),
    needsShipping: !!cart.needsShippingAddress
  }
}

// WooCommerce messages contain HTML entities and tags ("Coupon &quot;x&quot;...")
export function plainError (message: string) {
  return message
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// Run a cart query/mutation and answer with a Cart (or { error } on failure)
export async function cartResponse<T> (
  query: string,
  variables: object,
  pick: (data: T) => RawCart,
  translate: (message: string) => string = plainError
) {
  const json = await cartQuery<T>(query, variables)
  if (json.errors) {
    const detail = plainError(json.errors[0].message)
    return Response.json({ error: translate(detail), detail }, { status: 422 })
  }
  return Response.json(toCart(json.data ? pick(json.data) : null))
}
