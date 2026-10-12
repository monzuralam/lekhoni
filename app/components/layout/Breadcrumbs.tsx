import Link from 'next/link'

export type Crumb = { label: string; href?: string }

// Home is always first; the last crumb is the current page (no link)
export default function Breadcrumbs ({ items }: { items: Crumb[] }) {
  const crumbs: Crumb[] = [{ label: 'হোম', href: '/' }, ...items]

  return (
    <nav aria-label='ব্রেডক্রাম্ব'>
      <ol className='flex flex-wrap items-center gap-2 text-sm text-muted'>
        {crumbs.map((crumb, index) =>
          index === crumbs.length - 1 ? (
            <li key={index} aria-current='page' className='font-medium text-ink-2'>
              {crumb.label}
            </li>
          ) : (
            <li key={index} className='flex items-center gap-2'>
              {crumb.href ? (
                <Link href={crumb.href} className='transition hover:text-link'>
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              <span aria-hidden='true' className='text-line'>
                /
              </span>
            </li>
          )
        )}
      </ol>
    </nav>
  )
}
