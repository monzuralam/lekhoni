import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { bn } from '@/lib/bn'
import { CartSpinner } from '../components/cart/CartPage'
import { getActiveOrderCount, requireCustomer } from '../components/account/data'
import WishlistCount from '../components/wishlist/WishlistCount'

export const metadata: Metadata = {
  title: 'আমার অ্যাকাউন্ট | লেখনী',
  robots: { index: false, follow: false }
}

const TABS = ['orders', 'addresses', 'details', 'wishlist']

const TILE =
  'flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lift'
const TILE_ICON = 'grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-link'
const TEXT_LINK = 'font-semibold text-link hover:underline'

export default function Page ({ searchParams }: PageProps<'/my-account'>) {
  return (
    <Suspense fallback={<CartSpinner />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  )
}

async function Dashboard ({ searchParams }: { searchParams: PageProps<'/my-account'>['searchParams'] }) {
  // Old design links: /account?tab=orders -> /account/orders
  const { tab } = await searchParams
  if (typeof tab === 'string' && TABS.includes(tab)) redirect(`/my-account/${tab}`)

  const customer = await requireCustomer('/my-account')
  const active = await getActiveOrderCount()
  const name = customer.firstName || customer.displayName || customer.username || ''

  const tiles = [
    { href: '/my-account/orders', icon: 'truck', value: bn(customer.orderCount ?? 0), label: 'মোট অর্ডার' },
    { href: '/my-account/orders', icon: 'clock', value: bn(active), label: 'চলমান অর্ডার' },
    { href: '/my-account/wishlist', icon: 'heart', value: <WishlistCount />, label: 'পছন্দের পণ্য' }
  ]

  return (
    <section className='space-y-6'>
      <div className='rounded-card bg-accent/10 p-6 sm:p-8'>
        <h2 className='text-2xl text-ink'>শুভেচ্ছা{name ? `, ${name}` : ''}!</h2>
        <p className='mt-2 text-ink-2'>
          এখান থেকে আপনার{' '}
          <Link href='/my-account/orders' className={TEXT_LINK}>
            সাম্প্রতিক অর্ডার
          </Link>{' '}
          দেখতে,{' '}
          <Link href='/my-account/addresses' className={TEXT_LINK}>
            ডেলিভারির ঠিকানা
          </Link>{' '}
          ঠিক করতে এবং{' '}
          <Link href='/my-account/details' className={TEXT_LINK}>
            পাসওয়ার্ড ও তথ্য
          </Link>{' '}
          বদলাতে পারবেন।
        </p>
      </div>
      <ul className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {tiles.map(tile => (
          <li key={tile.label}>
            <Link href={tile.href} className={TILE}>
              <span className={TILE_ICON}>
                <svg className='icon size-6' aria-hidden='true'>
                  <use href={`#i-${tile.icon}`} />
                </svg>
              </span>
              <span>
                <span className='block font-serif text-2xl font-bold text-ink'>{tile.value}</span>
                <span className='block text-sm text-muted'>{tile.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-6 shadow-soft'>
        <p className='flex items-center gap-3 text-ink-2'>
          <span className='grid size-11 shrink-0 place-items-center rounded-full bg-star/20 text-ink'>
            <svg className='icon size-5' aria-hidden='true'>
              <use href='#i-gift' />
            </svg>
          </span>
          <span>নোটবুক, কলম, মগ আর উপহারের নতুন সংগ্রহ দেখতে শপ ঘুরে আসুন।</span>
        </p>
        <Link
          href='/shop'
          className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          শপে যান
        </Link>
      </div>
    </section>
  )
}
