import Link from 'next/link'
import WishlistCount from '../wishlist/WishlistCount'
import { getPrimaryMenu } from './menu'
import NavMenu from './NavMenu'
import ThemeToggle from './ThemeToggle'

// Header menu from the WordPress "Primary menu" location (Appearance > Menus)
export default async function Nav () {
  const items = await getPrimaryMenu()

  return (
    <NavMenu items={items}>
      {/* Mobile only: actions that do not fit in the header bar */}
      <div className='flex items-center gap-2 pt-3 nav:hidden'>
        <Link
          href='/my-account/wishlist'
          className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 flex-1 px-3'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-heart' />
          </svg>
          পছন্দ (<WishlistCount />)
        </Link>
        <Link
          href='/my-account'
          className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 flex-1 px-3'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-user' />
          </svg>
          অ্যাকাউন্ট
        </Link>
        <ThemeToggle className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link shrink-0 border border-line' />
      </div>
    </NavMenu>
  )
}
