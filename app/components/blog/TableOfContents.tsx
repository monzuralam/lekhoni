'use client'

import { useEffect, useState } from 'react'
import type { Heading } from './format'

// COMPONENT: TableOfContents. Port of initToc() in design/assets/js/main.js.
// The headings (with ids) come from the server; an IntersectionObserver
// marks the one being read. The mobile <details> and the sticky aside each
// render this list.

export default function TableOfContents ({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px' }
    )
    headings.forEach(heading => {
      const node = document.getElementById(heading.id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [headings])

  return (
    <nav aria-label='সূচিপত্র'>
      <ol className='space-y-0.5'>
        {headings.map(heading => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              data-active={active === heading.id ? '' : undefined}
              className={
                heading.level === 2
                  ? 'block border-l-2 border-line py-1 pl-3 text-sm leading-snug text-ink-2 transition hover:text-link data-active:border-accent data-active:font-semibold data-active:text-link'
                  : 'block border-l-2 border-line py-1 pl-7 text-[0.8125rem] leading-snug text-muted transition hover:text-link data-active:border-accent data-active:font-semibold data-active:text-link'
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
