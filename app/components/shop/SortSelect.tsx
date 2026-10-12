'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

// COMPONENT: ShopToolbar sort (design/shop.html <select data-shop-sort>).
// A GET form that keeps the current filters as hidden fields, so it also
// works without JS; with JS a change replaces ?sort= and resets the page.

type SortSelectProps = {
  action: string
  value: string
  options: { value: string; label: string }[]
  hidden: [string, string][] // current filters, minus sort and page
}

export default function SortSelect ({ action, value, options, hidden }: SortSelectProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function change (sort: string) {
    const params = new URLSearchParams(hidden)
    if (sort !== 'default') params.set('sort', sort)
    const query = params.toString()
    startTransition(() => router.push(query ? `${action}?${query}` : action, { scroll: false }))
  }

  return (
    <form action={action} method='get' className='contents'>
      {hidden.map(([name, val], index) => (
        <input key={`${name}-${index}`} type='hidden' name={name} value={val} />
      ))}
      <label htmlFor='shop-sort' className='sr-only'>
        সাজান
      </label>
      <select
        id='shop-sort'
        name='sort'
        data-shop-sort
        // Keyed on the URL value so back/forward navigation resets it
        key={value}
        defaultValue={value}
        onChange={event => change(event.target.value)}
        className='rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type='submit' className='rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink'>
          সাজান
        </button>
      </noscript>
    </form>
  )
}
