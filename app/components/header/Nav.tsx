import Link from 'next/link'

export default function Nav () {
  return (
    <nav
      id='site-nav'
      aria-label='প্রধান মেনু'
      className='group-data-reading/body:hidden max-nav:hidden max-nav:max-h-[calc(100dvh-5rem)] max-nav:overflow-y-auto max-nav:border-t max-nav:border-line max-nav:py-2 max-nav:data-open:block nav:pb-2'
    >
      <ul
        data-menu
        className='flex max-nav:flex-col nav:items-center nav:justify-center nav:gap-1'
      >
        <li className='group/l1 relative max-nav:border-b max-nav:border-line'>
          <div className='flex items-center'>
            <Link
              href='/'
              data-menu-label
              className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1 cursor-default'
            >
              হোম
            </Link>
          </div>
        </li>
        <li className='group/l1 relative max-nav:border-b max-nav:border-line'>
          <div className='flex items-center'>
            <a
              href='blog.html'
              data-menu-label
              className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1'
            >
              ব্লগ
            </a>
            <button
              type='button'
              data-submenu-toggle
              aria-expanded='false'
              aria-label='ব্লগ সাবমেনু'
              className='grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-link nav:-ml-2.5 nav:size-6'
            >
              <svg
                className='icon size-4 transition duration-200 group-data-open/l1:rotate-180'
                aria-hidden='true'
              >
                <use href='#i-chevron-down' />
              </svg>
            </button>
          </div>
          <ul className='max-nav:mb-2 max-nav:ml-2 max-nav:hidden max-nav:border-l max-nav:border-line max-nav:pl-2 max-nav:group-data-open/l1:block nav:invisible nav:absolute nav:left-0 nav:top-full nav:z-50 nav:min-w-52 nav:translate-y-1 nav:rounded-card nav:border nav:border-line nav:bg-surface nav:p-2 nav:opacity-0 nav:shadow-lift nav:transition nav:duration-200 nav:group-hover/l1:visible nav:group-hover/l1:translate-y-0 nav:group-hover/l1:opacity-100 nav:group-focus-within/l1:visible nav:group-focus-within/l1:translate-y-0 nav:group-focus-within/l1:opacity-100 nav:group-data-open/l1:visible nav:group-data-open/l1:translate-y-0 nav:group-data-open/l1:opacity-100'>
            <li className='group/l2 relative'>
              <div className='flex items-center'>
                <span
                  data-menu-label
                  className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link cursor-default'
                >
                  টিউটোরিয়াল
                </span>
                <button
                  type='button'
                  data-submenu-toggle
                  aria-expanded='false'
                  aria-label='টিউটোরিয়াল সাবমেনু'
                  className='grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-link nav:size-7'
                >
                  <svg
                    className='icon size-4 transition duration-200 max-nav:group-data-open/l2:rotate-180 nav:-rotate-90'
                    aria-hidden='true'
                  >
                    <use href='#i-chevron-down' />
                  </svg>
                </button>
              </div>
              <ul className='max-nav:mb-1 max-nav:ml-2 max-nav:hidden max-nav:border-l max-nav:border-line max-nav:pl-2 max-nav:group-data-open/l2:block nav:invisible nav:absolute nav:left-full nav:-top-2 nav:z-50 nav:min-w-48 nav:rounded-card nav:border nav:border-line nav:bg-surface nav:p-2 nav:opacity-0 nav:shadow-lift nav:transition nav:duration-200 nav:group-hover/l2:visible nav:group-hover/l2:opacity-100 nav:group-focus-within/l2:visible nav:group-focus-within/l2:opacity-100 nav:group-data-open/l2:visible nav:group-data-open/l2:opacity-100'>
                <li>
                  <a
                    href='category.html?topic=graphql'
                    className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
                  >
                    GraphQL
                  </a>
                </li>
                <li>
                  <a
                    href='category.html?topic=nextjs'
                    className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
                  >
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href='category.html?topic=wordpress'
                    className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
                  >
                    ওয়ার্ডপ্রেস
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a
                href='archive.html'
                className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
              >
                আর্কাইভ
              </a>
            </li>
            <li>
              <a
                href='topics.html'
                className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
              >
                সব বিষয়
              </a>
            </li>
          </ul>
        </li>
        <li className='max-nav:border-b max-nav:border-line'>
          <a
            href='shop.html'
            data-menu-label
            className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1'
          >
            শপ
          </a>
        </li>
        <li className='max-nav:border-b max-nav:border-line'>
          <a
            href='about.html'
            className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1'
          >
            আমাদের সম্পর্কে
          </a>
        </li>
        <li className='max-nav:border-b max-nav:border-line'>
          <a
            href='contact.html'
            className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1'
          >
            যোগাযোগ
          </a>
        </li>
        <li className='group/l1 relative'>
          <div className='flex items-center'>
            <span
              data-menu-label
              className='flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1 cursor-default'
            >
              আরো
            </span>
            <button
              type='button'
              data-submenu-toggle
              aria-expanded='false'
              aria-label='আরো সাবমেনু'
              className='grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-link nav:-ml-2.5 nav:size-6'
            >
              <svg
                className='icon size-4 transition duration-200 group-data-open/l1:rotate-180'
                aria-hidden='true'
              >
                <use href='#i-chevron-down' />
              </svg>
            </button>
          </div>
          <ul className='max-nav:mb-2 max-nav:ml-2 max-nav:hidden max-nav:border-l max-nav:border-line max-nav:pl-2 max-nav:group-data-open/l1:block nav:invisible nav:absolute nav:left-0 nav:top-full nav:z-50 nav:min-w-52 nav:translate-y-1 nav:rounded-card nav:border nav:border-line nav:bg-surface nav:p-2 nav:opacity-0 nav:shadow-lift nav:transition nav:duration-200 nav:group-hover/l1:visible nav:group-hover/l1:translate-y-0 nav:group-hover/l1:opacity-100 nav:group-focus-within/l1:visible nav:group-focus-within/l1:translate-y-0 nav:group-focus-within/l1:opacity-100 nav:group-data-open/l1:visible nav:group-data-open/l1:translate-y-0 nav:group-data-open/l1:opacity-100 nav:left-auto nav:right-0'>
            <li>
              <a
                href='styleguide.html'
                className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
              >
                স্টাইল গাইড
              </a>
            </li>
            <li>
              <a
                href='elements.html'
                className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
              >
                ব্লক এলিমেন্টস
              </a>
            </li>
            <li>
              <a
                href='demo.html'
                className='block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
              >
                ডেমো হাব
              </a>
            </li>
          </ul>
        </li>
      </ul>
      {/* Mobile only: actions that do not fit in the header bar */}
      <div className='flex items-center gap-2 pt-3 nav:hidden'>
        <a
          href='account.html?tab=wishlist'
          className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 flex-1 px-3'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-heart' />
          </svg>
          পছন্দ (<span data-wishlist-count>০</span>)
        </a>
        <a
          href='account.html'
          className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 flex-1 px-3'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-user' />
          </svg>
          অ্যাকাউন্ট
        </a>
        <button
          type='button'
          data-theme-toggle
          aria-pressed='false'
          aria-label='ডার্ক মোড চালু করুন'
          className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link shrink-0 border border-line'
        >
          <svg className='icon size-5 dark:hidden' aria-hidden='true'>
            <use href='#i-moon' />
          </svg>
          <svg className='icon size-5 hidden dark:block' aria-hidden='true'>
            <use href='#i-sun' />
          </svg>
        </button>
      </div>
    </nav>
  )
}
