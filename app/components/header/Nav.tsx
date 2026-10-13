import { Suspense } from 'react'
import Link from 'next/link'
import type { ThemeSettings } from '@/lib/theme-settings'
import WishlistCount from '../wishlist/WishlistCount'
import { getPrimaryMenu } from './menu'
import NavMenu, { CurrentNavMenu } from './NavMenu'
import ThemeToggle from './ThemeToggle'

const ACTION =
  'inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 flex-1 px-3'

// Header menu from the WordPress "Primary menu" location (Appearance > Menus).
// `header` (Theme Settings) decides which mobile-only actions appear.
export default async function Nav ({ header }: { header: ThemeSettings['header'] }) {
  const items = await getPrimaryMenu()

  // Mobile only: actions that do not fit in the header bar
  const actions = (header.wishlist || header.account || header.themeToggle) && (
    <div className='flex items-center gap-2 pt-3 nav:hidden'>
      {header.wishlist && (
        <Link href='/my-account/wishlist' className={ACTION}>
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-heart' />
          </svg>
          পছন্দ (<WishlistCount />)
        </Link>
      )}
      {header.account && (
        <Link href='/my-account' className={ACTION}>
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-user' />
          </svg>
          অ্যাকাউন্ট
        </Link>
      )}
      {header.themeToggle && (
        <ThemeToggle className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link shrink-0 border border-line' />
      )}
    </div>
  )

  // The highlight needs the current path, which streams in on routes with
  // dynamic params; until then the menu renders without it
  return (
    <Suspense fallback={<NavMenu items={items}>{actions}</NavMenu>}>
      <CurrentNavMenu items={items}>{actions}</CurrentNavMenu>
    </Suspense>
  )
}
