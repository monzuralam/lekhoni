'use client'

import { bn } from '@/lib/bn'
import { useWishlist } from './store'

// Live wishlist count for the header badge and the mobile menu.
// `data-empty` lets the badge hide itself (data-empty:hidden) at zero.
export default function WishlistCount ({ className }: { className?: string }) {
  const count = useWishlist().length

  return (
    <span data-wishlist-count data-empty={count === 0 || undefined} className={className}>
      {bn(count)}
    </span>
  )
}
