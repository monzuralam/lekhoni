import Link from 'next/link'
import { getThemeSettings } from '@/lib/theme-settings'
import SocialLinks from './layout/SocialLinks'
import Nav from './header/Nav'
import Logo from './header/Logo'
import CartButton from './cart/CartButton'
import WishlistCount from './wishlist/WishlistCount'
import NavProvider, { NavToggle } from './header/NavProvider'
import ThemeToggle from './header/ThemeToggle'

// Site header. Logo, social icons and which buttons show come from
// Theme Settings (lib/theme-settings.ts); the menu from Appearance → Menus.
export default async function Header () {
  const settings = await getThemeSettings()
  const { header } = settings

  return (
    <header
      data-sticky-header
      className='sticky top-0 z-40 border-b border-transparent bg-page/90 backdrop-blur-md transition-[border-color,box-shadow] duration-300 group-data-scrolled/body:border-line group-data-scrolled/body:shadow-soft print:hidden'
    >
      <NavProvider>
        <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
          <div className='grid grid-cols-[1fr_auto] items-center gap-3 py-4 transition-[padding] duration-300 group-data-scrolled/body:py-2 nav:grid-cols-[1fr_auto_1fr]'>
            {/* Left column (large screens); kept even when empty so the logo stays centred */}
            <div className='max-nav:hidden'>
              {header.social && <SocialLinks links={settings.social} variant='header' />}
            </div>

            <Logo settings={settings} />

            <div className='flex items-center justify-end gap-0.5'>
              {header.search && (
                <button
                  type='button'
                  data-search-open
                  aria-label='খুঁজুন'
                  aria-keyshortcuts='Control+K'
                  className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link'
                >
                  <svg className='icon size-5' aria-hidden='true'>
                    <use href='#i-search' />
                  </svg>
                </button>
              )}
              {header.wishlist && (
                <Link
                  href='/my-account/wishlist'
                  aria-label='পছন্দের তালিকা'
                  className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden'
                >
                  <svg className='icon size-5' aria-hidden='true'>
                    <use href='#i-heart' />
                  </svg>
                  <WishlistCount className='absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-accent-ink data-empty:hidden' />
                </Link>
              )}
              <CartButton />
              {header.account && (
                <Link
                  href='/my-account'
                  aria-label='আমার অ্যাকাউন্ট'
                  className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden'
                >
                  <svg className='icon size-5' aria-hidden='true'>
                    <use href='#i-user' />
                  </svg>
                </Link>
              )}
              {header.themeToggle && (
                <ThemeToggle className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden' />
              )}
              <NavToggle />
            </div>
          </div>

          <Nav header={header} />
        </div>
      </NavProvider>
    </header>
  )
}
