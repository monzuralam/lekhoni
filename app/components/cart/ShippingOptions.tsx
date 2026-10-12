'use client'

import { useState } from 'react'
import { useCart } from './CartProvider'

// Replaces the design's hardcoded "delivery zone" radios with the shipping
// rates WooCommerce offers this session (cart.availableShippingMethods).
export default function ShippingOptions () {
  const { cart, setShipping } = useCart()
  const [pending, setPending] = useState(false)
  if (!cart) return null

  if (!cart.shippingPackages.some(rates => rates.length)) {
    return (
      <p className='flex items-start gap-2 rounded-xl bg-surface-2 p-4 text-sm text-ink-2'>
        <svg className='icon mt-0.5 size-4 shrink-0 text-link' aria-hidden='true'>
          <use href='#i-truck' />
        </svg>
        {cart.needsShipping
          ? 'ডেলিভারির ঠিকানা অনুযায়ী চার্জ চেকআউটে হিসাব হবে।'
          : 'এই অর্ডারের জন্য আলাদা কোনো ডেলিভারি চার্জ নেই।'}
      </p>
    )
  }

  const current = cart
  async function choose (packageIndex: number, rateId: string) {
    const methods = current.shippingPackages.map((rates, index) =>
      index === packageIndex ? rateId : current.chosenShipping[index] ?? rates[0]?.id ?? ''
    )
    setPending(true)
    await setShipping(methods)
    setPending(false)
  }

  return (
    <>
      {cart.shippingPackages.map((rates, index) =>
        rates.length ? (
          <fieldset key={index} disabled={pending} aria-busy={pending || undefined}>
            <legend className='mb-1.5 block text-sm font-medium text-ink'>ডেলিভারি পদ্ধতি</legend>
            <div className='grid gap-2'>
              {rates.map(rate => (
                <label
                  key={rate.id}
                  className='flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink-2 transition hover:border-accent has-checked:border-accent has-checked:bg-accent/5 has-checked:text-ink'
                >
                  <input
                    type='radio'
                    name={`shipping_method_${index}`}
                    value={rate.id}
                    checked={(cart.chosenShipping[index] ?? rates[0].id) === rate.id}
                    onChange={() => choose(index, rate.id)}
                    className='size-4 accent-accent'
                  />
                  <span className='flex-1'>{rate.label}</span>
                  <span className='font-semibold text-ink'>{rate.free ? 'ফ্রি' : rate.cost}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null
      )}
    </>
  )
}
