import Link from 'next/link'
import Nav from './header/Nav'
import Logo from './header/Logo'

export default function Header () {
  return (
    <header
      data-sticky-header
      className='sticky top-0 z-40 border-b border-transparent bg-page/90 backdrop-blur-md transition-[border-color,box-shadow] duration-300 group-data-scrolled/body:border-line group-data-scrolled/body:shadow-soft print:hidden'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='grid grid-cols-[1fr_auto] items-center gap-3 py-4 transition-[padding] duration-300 group-data-scrolled/body:py-2 nav:grid-cols-[1fr_auto_1fr]'>
          <div className='flex items-center gap-0.5 max-nav:hidden'>
            <Link
              href='#'
              aria-label='ফেসবুক'
              className='grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-link'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-facebook' />
              </svg>
            </Link>
            <a
              href='#'
              aria-label='এক্স'
              className='grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-link'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-x' />
              </svg>
            </a>
            <a
              href='#'
              aria-label='ইনস্টাগ্রাম'
              className='grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-link'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-instagram' />
              </svg>
            </a>
            <a
              href='#'
              aria-label='RSS ফিড'
              className='grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-link'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-rss' />
              </svg>
            </a>
          </div>

          <Logo />

          <div className='flex items-center justify-end gap-0.5'>
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
            <a
              href='account.html?tab=wishlist'
              aria-label='পছন্দের তালিকা'
              className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden'
            >
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-heart' />
              </svg>
              <span
                data-wishlist-count
                data-empty
                className='absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-accent-ink data-empty:hidden'
              >
                ০
              </span>
            </a>
            <button
              type='button'
              data-cart-open
              aria-label='কার্ট খুলুন'
              className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link'
            >
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-cart' />
              </svg>
              <span
                data-cart-count
                data-empty
                className='absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-accent-ink data-empty:hidden'
              >
                ০
              </span>
            </button>
            <a
              href='account.html'
              aria-label='আমার অ্যাকাউন্ট'
              className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden'
            >
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-user' />
              </svg>
            </a>
            <button
              type='button'
              data-theme-toggle
              aria-pressed='false'
              aria-label='ডার্ক মোড চালু করুন'
              className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link max-nav:hidden'
            >
              <svg className='icon size-5 dark:hidden' aria-hidden='true'>
                <use href='#i-moon' />
              </svg>
              <svg className='icon size-5 hidden dark:block' aria-hidden='true'>
                <use href='#i-sun' />
              </svg>
            </button>
            <button
              type='button'
              data-nav-toggle
              aria-expanded='false'
              aria-controls='site-nav'
              aria-label='মেনু খুলুন'
              className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link group/burger nav:hidden'
            >
              <svg
                className='icon size-5 group-aria-expanded/burger:hidden'
                aria-hidden='true'
              >
                <use href='#i-menu' />
              </svg>
              <svg
                className='icon size-5 hidden group-aria-expanded/burger:block'
                aria-hidden='true'
              >
                <use href='#i-close' />
              </svg>
            </button>
          </div>
        </div>

        <Nav />
      </div>
    </header>
  )
}
