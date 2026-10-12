'use client'

import { bn } from '@/lib/bn'
import { useCart } from './CartProvider'

// Header cart button: opens the cart drawer and shows the item count
export default function CartButton () {
  const { cart, isOpen, open } = useCart()
  const count = cart?.count ?? 0

  return (
    <button
      type='button'
      onClick={open}
      aria-label='কার্ট খুলুন'
      aria-haspopup='dialog'
      aria-expanded={isOpen}
      className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link'
    >
      <svg className='icon size-5' aria-hidden='true'>
        <use href='#i-cart' />
      </svg>
      <span
        data-empty={!count || undefined}
        className='absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-accent-ink data-empty:hidden'
      >
        {bn(count)}
      </span>
    </button>
  )
}
