'use client'

import { useState } from 'react'
import { useCart } from './CartProvider'

type AddToCartButtonProps = {
  productId: number
  name: string
  className?: string
  label?: string // default 'কার্টে যোগ করুন'
  icon?: string // sprite icon, default 'cart'
}

export default function AddToCartButton ({ productId, name, className, label = 'কার্টে যোগ করুন', icon = 'cart' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [pending, setPending] = useState(false)

  return (
    <button
      type='button'
      data-add-to-cart
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={async () => {
        setPending(true)
        await addItem(productId, name)
        setPending(false)
      }}
      className={className}
    >
      {pending ? (
        <span
          aria-hidden='true'
          className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
        />
      ) : (
        <svg className='icon size-4' aria-hidden='true'>
          <use href={`#i-${icon}`} />
        </svg>
      )}
      {pending ? 'যোগ হচ্ছে…' : label}
    </button>
  )
}
