// Cart shape returned by /api/cart, shared by the route and client components
export type CartItem = {
  key: string
  productId: number
  name: string
  uri: string
  image: string | null
  variant: string | null
  quantity: number
  total: string // line total after coupons (formatted)
  price: string // unit price (formatted)
  subtotal: string // line total before coupons (formatted)
}

export type ShippingRate = {
  id: string // e.g. "flat_rate:3", sent back to updateShippingMethod
  label: string
  cost: string // formatted
  free: boolean
}

export type AppliedCoupon = { code: string; amount: string }

// WooCommerce cart fees, e.g. the routine bundle discount (negative)
export type CartFee = { name: string; amount: string; negative: boolean }

export type Cart = {
  count: number
  subtotal: string
  items: CartItem[]
  // Totals (formatted, Bangla digits)
  discountTotal: string
  hasDiscount: boolean
  shippingTotal: string
  total: string
  coupons: AppliedCoupon[]
  fees: CartFee[]
  // One rate list per shipping package (usually one package)
  shippingPackages: ShippingRate[][]
  chosenShipping: string[]
  needsShipping: boolean
}

export const EMPTY_CART: Cart = {
  count: 0,
  subtotal: '',
  items: [],
  discountTotal: '',
  hasDiscount: false,
  shippingTotal: '',
  total: '',
  coupons: [],
  fees: [],
  shippingPackages: [],
  chosenShipping: [],
  needsShipping: false
}

// Order summary kept after checkout (see /api/checkout and /order-received)
export type OrderSummary = {
  id: number
  key: string
  number: string
  date: string // ISO
  payment: string
  paymentMethod?: string // gateway id, e.g. 'bacs' (missing in older cookies)
  subtotal: string
  discount: string | null
  fees?: CartFee[] // missing in older cookies
  shipping: string | null // null = free / no shipping charge
  total: string
  name: string
  phone: string
  address: string
  items: { name: string; variant: string | null; quantity: number; total: string; image: string | null }[]
  moreItems: number // items left out to keep the cookie small
}
