import { cookies } from 'next/headers'
import { CART_FIELDS, cartQuery, plainError, toCart, type RawCart } from '@/lib/cart'
import { formatPrice } from '@/lib/products'
import type { OrderSummary } from '@/lib/cart-types'
import { gatewayTitle } from '@/app/components/checkout/gateways'
import { findDistrict } from '@/app/components/checkout/locations'
import {
  normalizePhone,
  readFields,
  validateCheckout
} from '@/app/components/checkout/validation'
import {
  ORDER_COOKIE,
  ORDER_COOKIE_MAX_AGE,
  ORDER_COOKIE_PATH,
  encodeOrder
} from '@/app/components/checkout/order-cookie'

type RawOrder = {
  databaseId: number
  orderKey: string | null
  orderNumber: string | null
  date: string | null
  subtotal: string | null
  discountTotal: string | null
  rawDiscount: string | null
  shippingTotal: string | null
  rawShipping: string | null
  total: string | null
  paymentMethodTitle: string | null
} | null

const CHECKOUT = `
  mutation Checkout(
    $billing: CustomerAddressInput
    $shipping: CustomerAddressInput
    $paymentMethod: String
    $shippingMethod: [String]
    $customerNote: String
    $metaData: [MetaDataInput]
  ) {
    checkout(input: {
      billing: $billing
      shipping: $shipping
      shipToDifferentAddress: false
      paymentMethod: $paymentMethod
      shippingMethod: $shippingMethod
      customerNote: $customerNote
      metaData: $metaData
    }) {
      result
      redirect
      order {
        databaseId
        orderKey
        orderNumber
        date
        subtotal
        discountTotal
        rawDiscount: discountTotal(format: RAW)
        shippingTotal
        rawShipping: shippingTotal(format: RAW)
        total
        paymentMethodTitle
      }
    }
  }
`

const positive = (value: string | null | undefined) => Number(value ?? 0) > 0

// POST /api/checkout { name, phone, email, division, district, thana, address, note, paymentMethod }
// -> { orderId, orderKey, orderNumber, redirect } | { error, fieldErrors? }
export async function POST (request: Request) {
  const body = (await request.json().catch(() => null)) ?? {}
  const fields = readFields(body)
  const fieldErrors = validateCheckout(fields)
  if (Object.keys(fieldErrors).length) {
    return Response.json({ error: 'ফর্মের তথ্যগুলো ঠিক করুন।', fieldErrors }, { status: 400 })
  }

  // The cart as it is right now: what is about to be ordered
  const before = await cartQuery<{ cart: RawCart }>(`{ cart { ${CART_FIELDS} } }`)
  const cart = toCart(before.data?.cart ?? null)
  if (!cart.items.length) {
    return Response.json({ error: 'আপনার কার্ট খালি।' }, { status: 422 })
  }

  const district = findDistrict(fields.division, fields.district)!
  const name = fields.name.trim().replace(/\s+/g, ' ')
  const split = name.lastIndexOf(' ')
  const address = {
    firstName: split > 0 ? name.slice(0, split) : name,
    lastName: split > 0 ? name.slice(split + 1) : '',
    phone: normalizePhone(fields.phone),
    email: fields.email.trim() || undefined,
    address1: fields.address.trim(),
    city: fields.thana.trim(),
    state: district.code,
    country: 'BD'
  }

  const json = await cartQuery<{
    checkout: { result: string | null; redirect: string | null; order: RawOrder } | null
  }>(CHECKOUT, {
    billing: address,
    shipping: { ...address, email: undefined, phone: undefined },
    paymentMethod: fields.paymentMethod,
    shippingMethod: cart.chosenShipping.length ? cart.chosenShipping : null,
    customerNote: fields.note.trim() || null,
    metaData: [{ key: 'billing_division', value: fields.division }]
  })

  const order = json.data?.checkout?.order
  if (json.errors || !order) {
    const detail = json.errors ? plainError(json.errors[0].message) : ''
    return Response.json(
      { error: detail ? `অর্ডার সম্পন্ন করা যায়নি: ${detail}` : 'অর্ডার সম্পন্ন করা যায়নি, আবার চেষ্টা করুন।', detail },
      { status: 422 }
    )
  }

  // Items come from the cart we just ordered; totals from the created order
  const summary: OrderSummary = {
    id: order.databaseId,
    key: order.orderKey ?? '',
    number: order.orderNumber ?? String(order.databaseId),
    date: order.date ? new Date(order.date).toISOString() : new Date().toISOString(),
    payment: gatewayTitle(fields.paymentMethod, order.paymentMethodTitle),
    paymentMethod: fields.paymentMethod,
    subtotal: formatPrice(order.subtotal) || cart.subtotal,
    discount: positive(order.rawDiscount) ? formatPrice(order.discountTotal) : null,
    shipping: positive(order.rawShipping) ? formatPrice(order.shippingTotal) : null,
    total: formatPrice(order.total) || cart.total,
    name,
    phone: address.phone,
    address: [address.address1, address.city, district.name, fields.division].join(', '),
    items: cart.items.map(item => ({
      name: item.name,
      variant: item.variant,
      quantity: item.quantity,
      total: item.subtotal,
      image: item.image
    })),
    moreItems: 0
  }

  const store = await cookies()
  store.set(ORDER_COOKIE, encodeOrder(summary), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: ORDER_COOKIE_PATH,
    maxAge: ORDER_COOKIE_MAX_AGE
  })

  const query = new URLSearchParams({ order: String(summary.id), key: summary.key })
  return Response.json({
    orderId: summary.id,
    orderKey: summary.key,
    orderNumber: summary.number,
    redirect: `/order-received?${query}`
  })
}
