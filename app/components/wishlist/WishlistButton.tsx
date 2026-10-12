'use client'

import { toggleWishlist, useWishlist, type WishlistItem } from './store'

type WishlistButtonProps = {
  item: WishlistItem
  className?: string
}

// Heart toggle on product cards (design: [data-wishlist-toggle])
export default function WishlistButton ({ item, className }: WishlistButtonProps) {
  const on = useWishlist().some(entry => entry.id === item.id)

  return (
    <button
      type='button'
      data-wishlist-toggle
      aria-pressed={on}
      aria-label={on ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় যোগ করুন'}
      onClick={() => toggleWishlist(item)}
      className={className}
    >
      <svg className='icon size-4.5 group-aria-pressed/wish:fill-current' aria-hidden='true'>
        <use href='#i-heart' />
      </svg>
    </button>
  )
}
