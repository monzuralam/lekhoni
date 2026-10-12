import { CART_FIELDS, cartResponse, type RawCart } from '@/lib/cart'

// WooCommerce coupon errors are English; show the common ones in Bangla
function couponError (message: string) {
  if (/does not exist|not valid|invalid/i.test(message)) return 'এই কুপন কোডটি সঠিক নয়।'
  if (/already applied/i.test(message)) return 'এই কুপনটি আগেই প্রয়োগ করা হয়েছে।'
  if (/expired/i.test(message)) return 'এই কুপনের মেয়াদ শেষ হয়ে গেছে।'
  if (/minimum spend/i.test(message)) return 'এই কুপনের জন্য ন্যূনতম কেনাকাটার শর্ত পূরণ হয়নি।'
  if (/maximum spend/i.test(message)) return 'এই কুপন সর্বোচ্চ কেনাকাটার সীমা ছাড়িয়ে গেছে।'
  if (/usage limit/i.test(message)) return 'এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে।'
  if (/individual use/i.test(message)) return 'এই কুপন অন্য কুপনের সাথে ব্যবহার করা যায় না।'
  if (/not applicable|cannot be applied/i.test(message)) return 'এই কুপন আপনার কার্টের পণ্যে প্রযোজ্য নয়।'
  return 'কুপনটি প্রয়োগ করা যায়নি।'
}

async function readCode (request: Request) {
  const body = (await request.json().catch(() => null)) ?? {}
  return typeof body.code === 'string' ? body.code.trim() : ''
}

// POST /api/cart/coupon { code } -> Cart | { error, detail }
export async function POST (request: Request) {
  const code = await readCode(request)
  if (!code) return Response.json({ error: 'কুপন কোড লিখুন।' }, { status: 400 })
  return cartResponse<{ applyCoupon: { cart: RawCart } | null }>(
    `mutation ApplyCoupon($code: String!) {
      applyCoupon(input: { code: $code }) { cart { ${CART_FIELDS} } }
    }`,
    { code },
    data => data.applyCoupon?.cart ?? null,
    couponError
  )
}

// DELETE /api/cart/coupon { code } -> Cart
export async function DELETE (request: Request) {
  const code = await readCode(request)
  if (!code) return Response.json({ error: 'কুপন কোড পাওয়া যায়নি।' }, { status: 400 })
  return cartResponse<{ removeCoupons: { cart: RawCart } | null }>(
    `mutation RemoveCoupon($codes: [String]!) {
      removeCoupons(input: { codes: $codes }) { cart { ${CART_FIELDS} } }
    }`,
    { codes: [code] },
    data => data.removeCoupons?.cart ?? null,
    () => 'কুপনটি সরানো যায়নি।'
  )
}
