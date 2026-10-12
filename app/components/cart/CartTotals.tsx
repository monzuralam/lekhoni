import type { Cart } from '@/lib/cart-types'

// Shipping row text: the chosen rate's cost, "free", or a hint when
// WooCommerce needs an address before it can offer rates
function shippingLabel (cart: Cart) {
  const chosen = cart.shippingPackages
    .map((rates, index) => rates.find(rate => rate.id === cart.chosenShipping[index]) ?? rates[0])
    .filter(Boolean)
  if (chosen.length) return chosen.every(rate => rate.free) ? 'ফ্রি' : cart.shippingTotal
  if (cart.needsShipping) return 'ঠিকানা অনুযায়ী'
  return 'ফ্রি'
}

// Totals list shared by the cart page and the checkout summary
export default function CartTotals ({ cart }: { cart: Cart }) {
  return (
    <dl className='space-y-2.5 text-[0.95rem]'>
      <div className='flex items-center justify-between'>
        <dt className='text-ink-2'>সাবটোটাল</dt>
        <dd className='font-semibold text-ink'>{cart.subtotal}</dd>
      </div>
      {cart.hasDiscount && (
        <div className='flex items-center justify-between text-success'>
          <dt>কুপন ছাড়</dt>
          <dd className='font-semibold'>− {cart.discountTotal}</dd>
        </div>
      )}
      <div className='flex items-center justify-between'>
        <dt className='text-ink-2'>ডেলিভারি চার্জ</dt>
        <dd className='font-semibold text-ink'>{shippingLabel(cart)}</dd>
      </div>
      <div className='flex items-center justify-between border-t border-line pt-3 text-lg'>
        <dt className='font-semibold text-ink'>সর্বমোট</dt>
        <dd className='font-bold text-ink'>{cart.total}</dd>
      </div>
    </dl>
  )
}
