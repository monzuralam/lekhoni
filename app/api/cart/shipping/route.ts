import { CART_FIELDS, cartResponse, type RawCart } from '@/lib/cart'

async function readBody (request: Request) {
  return (await request.json().catch(() => null)) ?? {}
}

// POST /api/cart/shipping { methods: string[] } -> Cart
// One rate id per shipping package, e.g. ["flat_rate:3"]
export async function POST (request: Request) {
  const body = await readBody(request)
  const methods = Array.isArray(body.methods)
    ? body.methods.filter((id: unknown): id is string => typeof id === 'string' && !!id)
    : []
  if (!methods.length) {
    return Response.json({ error: 'ডেলিভারি পদ্ধতি বেছে নিন।' }, { status: 400 })
  }
  return cartResponse<{ updateShippingMethod: { cart: RawCart } | null }>(
    `mutation UpdateShippingMethod($methods: [String]) {
      updateShippingMethod(input: { shippingMethods: $methods }) { cart { ${CART_FIELDS} } }
    }`,
    { methods },
    data => data.updateShippingMethod?.cart ?? null,
    () => 'ডেলিভারি পদ্ধতি পরিবর্তন করা যায়নি।'
  )
}

// PUT /api/cart/shipping { country, state?, city?, postcode? } -> Cart
// Saves the delivery address on the session so WooCommerce recalculates the
// available shipping rates (zones are matched by country/state/postcode).
export async function PUT (request: Request) {
  const body = await readBody(request)
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const country = text(body.country).toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) {
    return Response.json({ error: 'Invalid country' }, { status: 400 })
  }
  const address = {
    country,
    state: text(body.state),
    city: text(body.city),
    postcode: text(body.postcode)
  }
  const json = await cartResponse<{ updateCustomer: unknown; cart: RawCart }>(
    `mutation UpdateAddress($shipping: CustomerAddressInput, $billing: CustomerAddressInput) {
      updateCustomer(input: { shipping: $shipping, billing: $billing }) { clientMutationId }
    }`,
    { shipping: address, billing: address },
    () => null
  )
  if (!json.ok) return json
  // Read the cart afterwards so the rates reflect the new address
  return cartResponse<{ cart: RawCart }>(`{ cart { ${CART_FIELDS} } }`, {}, data => data.cart)
}
