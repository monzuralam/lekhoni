'use client'

import { useState, type ReactNode } from 'react'

// Chips of "Shop by concern" (design: [data-filter-list] in
// design/home-cosmetics.html). Every product is rendered on the server; the
// chips only hide the ones without the chosen concern's product tag.

type ConcernFilterProps = {
  allLabel: string
  concerns: { key: string; label: string }[]
  items: { id: number; tags: string[]; card: ReactNode }[]
}

export default function ConcernFilter ({ allLabel, concerns, items }: ConcernFilterProps) {
  const [active, setActive] = useState('all')
  const visible = items.filter(item => active === 'all' || item.tags.includes(active))
  const chips = [{ key: 'all', label: allLabel }, ...concerns]

  return (
    <>
      <div role='group' aria-label='ত্বকের সমস্যা' className='scrollbar-none -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:justify-center'>
        {chips.map(chip => (
          <button
            key={chip.key}
            type='button'
            aria-pressed={active === chip.key}
            onClick={() => setActive(chip.key)}
            className='shrink-0 rounded-full border border-line bg-page px-5 py-2 text-sm font-semibold text-ink-2 transition hover:border-accent hover:text-link aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink'
          >
            {chip.label}
          </button>
        ))}
      </div>
      <ul className='mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4' aria-live='polite'>
        {items.map(item => (
          <li key={item.id} hidden={!visible.includes(item)}>
            {item.card}
          </li>
        ))}
      </ul>
      {!visible.length && <p className='mt-8 text-center text-ink-2'>এই সমস্যার জন্য এখনো কোনো পণ্য নেই।</p>}
    </>
  )
}
