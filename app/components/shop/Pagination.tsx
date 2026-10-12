import Link from 'next/link'
import { bn } from '@/lib/bn'

// COMPONENT: Pagination (design/shop.html <nav aria-label="পৃষ্ঠা নেভিগেশন">).
// Plain links, so paging works without JS and every page is shareable.

type PaginationProps = {
  page: number
  totalPages: number
  href: (page: number) => string
}

// 1 … 4 5 6 … 10: first, last and the current page's neighbours
function pageList (page: number, total: number) {
  const pages: (number | 'gap')[] = []
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - page) <= 1) pages.push(n)
    else if (pages[pages.length - 1] !== 'gap') pages.push('gap')
  }
  return pages
}

const pill = 'inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-medium'

export default function Pagination ({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label='পৃষ্ঠা নেভিগেশন' className='mt-10 flex justify-center'>
      <ul className='flex flex-wrap items-center gap-2'>
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} rel='prev' className={`${pill} bg-surface text-ink-2 transition hover:border-accent hover:text-link`}>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-left' />
              </svg>
              আগের
            </Link>
          ) : (
            <span aria-disabled='true' className={`${pill} cursor-not-allowed text-muted opacity-60`}>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-left' />
              </svg>
              আগের
            </span>
          )}
        </li>
        {pageList(page, totalPages).map((n, index) =>
          n === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden='true' className='px-1 text-muted'>
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <Link
                  href={href(n)}
                  aria-current='page'
                  aria-label={`পৃষ্ঠা ${bn(n)}, বর্তমান পৃষ্ঠা`}
                  className='grid size-10 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-ink'
                >
                  {bn(n)}
                </Link>
              ) : (
                <Link
                  href={href(n)}
                  aria-label={`পৃষ্ঠা ${bn(n)}`}
                  className='grid size-10 place-items-center rounded-full border border-line bg-surface text-sm font-medium text-ink-2 transition hover:border-accent hover:text-link'
                >
                  {bn(n)}
                </Link>
              )}
            </li>
          )
        )}
        <li>
          {page < totalPages ? (
            <Link href={href(page + 1)} rel='next' className={`${pill} bg-surface text-ink-2 transition hover:border-accent hover:text-link`}>
              পরের
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </Link>
          ) : (
            <span aria-disabled='true' className={`${pill} cursor-not-allowed text-muted opacity-60`}>
              পরের
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
