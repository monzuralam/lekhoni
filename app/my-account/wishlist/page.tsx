import type { Metadata } from 'next'
import WishlistGrid from '../../components/wishlist/WishlistGrid'

// Open to guests too: the list lives in this browser's localStorage
// ("lk-wishlist", as in the design), so no login is needed to see it.

export const metadata: Metadata = {
  title: 'পছন্দের তালিকা | লেখনী',
  robots: { index: false, follow: false }
}

export default function Page () {
  return (
    <section>
      <h2 className='mb-5 text-2xl text-ink'>পছন্দের তালিকা</h2>
      <WishlistGrid />
    </section>
  )
}
