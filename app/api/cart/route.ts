import { CART_FIELDS, cartResponse as run, type RawCart } from '@/lib/cart'

// Cart fields (CART_FIELDS) and the RawCart -> Cart mapping live in lib/cart.ts,
// shared with /api/cart/coupon, /api/cart/shipping and /api/checkout.

async function readBody (request: Request) {
  return (await request.json().catch(() => null)) ?? {}
}

// GET /api/cart -> Cart
export async function GET () {
  return run<{ cart: RawCart }>(`{ cart { ${CART_FIELDS} } }`, {}, data => data.cart)
}

// POST /api/cart { productId, quantity, variationId?, attributes? } -> Cart
// attributes: { pa_size: 'large' } — required when a variation allows "any" value
export async function POST (request: Request) {
  const body = await readBody(request)
  const productId = Number(body.productId)
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1))
  const variationId = body.variationId == null ? null : Number(body.variationId)
  const variation =
    body.attributes && typeof body.attributes === 'object'
      ? Object.entries(body.attributes as Record<string, unknown>).map(([name, value]) => ({
        attributeName: name,
        attributeValue: String(value)
      }))
      : null
  if (!Number.isInteger(productId) || productId <= 0) {
    return Response.json({ error: 'Invalid product' }, { status: 400 })
  }
  if (variationId !== null && (!Number.isInteger(variationId) || variationId <= 0)) {
    return Response.json({ error: 'Invalid variation' }, { status: 400 })
  }
  return run<{ addToCart: { cart: RawCart } | null }>(
    `mutation AddToCart($productId: Int!, $quantity: Int, $variationId: Int, $variation: [ProductAttributeInput]) {
      addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId, variation: $variation }) { cart { ${CART_FIELDS} } }
    }`,
    { productId, quantity, variationId, variation },
    data => data.addToCart?.cart ?? null
  )
}

// PATCH /api/cart { key, quantity } -> Cart
export async function PATCH (request: Request) {
  const body = await readBody(request)
  const quantity = Math.floor(Number(body.quantity))
  if (typeof body.key !== 'string' || !Number.isInteger(quantity) || quantity < 1) {
    return Response.json({ error: 'Invalid item' }, { status: 400 })
  }
  return run<{ updateItemQuantities: { cart: RawCart } | null }>(
    `mutation UpdateQuantity($key: ID!, $quantity: Int!) {
      updateItemQuantities(input: { items: [{ key: $key, quantity: $quantity }] }) { cart { ${CART_FIELDS} } }
    }`,
    { key: body.key, quantity },
    data => data.updateItemQuantities?.cart ?? null
  )
}

// DELETE /api/cart { key } -> Cart
export async function DELETE (request: Request) {
  const body = await readBody(request)
  if (typeof body.key !== 'string') {
    return Response.json({ error: 'Invalid item' }, { status: 400 })
  }
  return run<{ removeItemsFromCart: { cart: RawCart } | null }>(
    `mutation RemoveItem($key: ID!) {
      removeItemsFromCart(input: { keys: [$key] }) { cart { ${CART_FIELDS} } }
    }`,
    { key: body.key },
    data => data.removeItemsFromCart?.cart ?? null
  )
}
