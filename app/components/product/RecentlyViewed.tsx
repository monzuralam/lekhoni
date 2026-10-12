'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, type ProductCardData } from '@/lib/products'

// Port of initRecentlyViewed() from design/assets/js/main.js. Product ids live
// in localStorage "lk-recent" (newest first, max 8); the cards come from
// /product/recently-viewed. On a product page pass `currentId`: it is recorded
// and left out of the list. Elsewhere (cart page) render it without props.

const STORAGE_KEY = 'lk-recent'
const MAX_STORED = 8

// Accepts plain ids and the design demo's { id } objects
function readIds (): number[] {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(list)) return []
    return list
      .map(item => Number(typeof item === 'object' && item ? item.id : item))
      .filter(id => Number.isInteger(id) && id > 0)
  } catch {
    return []
  }
}

function writeIds (ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* storage unavailable: nothing is remembered */
  }
}

type RecentlyViewedProps = {
  currentId?: number
  limit?: number
  title?: string
  className?: string
}

export default function RecentlyViewed ({
  currentId,
  limit = MAX_STORED,
  title = 'সম্প্রতি দেখেছেন',
  className = 'mx-auto mt-14 w-full max-w-site px-4 sm:px-6'
}: RecentlyViewedProps) {
  // Tagged with the product it was loaded for, so a client-side navigation
  // to another product never shows the previous page's list
  const [state, setState] = useState<{ for?: number; products: ProductCardData[] }>({ products: [] })

  useEffect(() => {
    let ids = readIds()
    if (currentId) {
      ids = [currentId, ...ids.filter(id => id !== currentId)].slice(0, MAX_STORED)
      writeIds(ids)
    }
    const shown = ids.filter(id => id !== currentId).slice(0, limit)
    if (!shown.length) return

    const controller = new AbortController()
    fetch(`/product/recently-viewed?ids=${shown.join(',')}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : []))
      .then(list => {
        if (Array.isArray(list)) setState({ for: currentId, products: list })
      })
      .catch(() => {
        /* aborted or offline: the section stays hidden */
      })
    return () => controller.abort()
  }, [currentId, limit])

  const products = state.for === currentId ? state.products : []
  if (!products.length) return null

  return (
    <section aria-labelledby='recent-viewed-title' className={className}>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <h2 id='recent-viewed-title' className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
          <span className='grid size-9 place-items-center rounded-full bg-accent/10 text-link'>
            <svg className='icon size-5' aria-hidden='true'>
              <use href='#i-clock' />
            </svg>
          </span>
          {title}
        </h2>
      </div>
      <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {products.map(product => (
          <li key={product.databaseId}>
            <Link
              href={product.uri}
              className='group/recent flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift'
            >
              {product.image?.sourceUrl ? (
                <Image
                  src={product.image.sourceUrl}
                  alt=''
                  width={64}
                  height={64}
                  className='size-16 shrink-0 rounded-xl bg-surface-2 object-cover'
                />
              ) : (
                <span className='size-16 shrink-0 rounded-xl bg-surface-2' />
              )}
              <span className='min-w-0'>
                <span className='line-clamp-2 text-sm font-semibold leading-snug text-ink transition group-hover/recent:text-link'>
                  {product.name}
                </span>
                <span className='text-sm font-bold text-ink-2'>{formatPrice(product.price)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
