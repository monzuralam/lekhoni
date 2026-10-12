'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { formatPrice, type ProductCardData } from '@/lib/products'
import ProductCard from '../ProductCard'
import { removeFromWishlist, useWishlist, type WishlistItem } from './store'

// The design's AccountWishlist: the saved products as cards (add to cart via
// ProductCard), each with a remove button. Ids come from localStorage, card
// data from /api/account/wishlist so prices and stock are current.

const REMOVE =
  'inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-danger/10 hover:text-danger'

const noop = () => () => {}

function RemoveButton ({ item }: { item: WishlistItem }) {
  return (
    <button
      type='button'
      onClick={() => removeFromWishlist(item.id)}
      aria-label={`${item.name || 'পণ্যটি'} পছন্দের তালিকা থেকে সরান`}
      className={REMOVE}
    >
      <svg className='icon size-4' aria-hidden='true'>
        <use href='#i-trash' />
      </svg>
      সরান
    </button>
  )
}

// A product that no longer comes back from the store (deleted or hidden):
// show what was saved so it can still be removed
function SavedCard ({ item }: { item: WishlistItem }) {
  return (
    <article className='flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft'>
      <div className='aspect-square bg-surface-2'>
        {item.image && (
          <Image src={item.image} alt='' width={400} height={400} className='size-full object-cover opacity-60' />
        )}
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-4'>
        <h3 className='line-clamp-2 font-serif text-base font-semibold leading-snug text-ink'>
          {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
        </h3>
        {item.price && <p className='text-lg font-bold text-ink'>{formatPrice(item.price)}</p>}
        <p className='mt-auto text-sm text-muted'>পণ্যটি এখন পাওয়া যাচ্ছে না</p>
      </div>
    </article>
  )
}

export default function WishlistGrid () {
  const items = useWishlist()
  const [products, setProducts] = useState<Map<number, ProductCardData>>(new Map())
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  // False during SSR and hydration, true afterwards
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  const ids = items.map(item => item.id)
  // Only fetch ids we don't have yet (removing an item needs no request)
  const missing = ids.filter(id => !products.has(id)).join(',')

  useEffect(() => {
    if (!missing) return
    const controller = new AbortController()
    fetch(`/api/account/wishlist?ids=${missing}`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : []))
      .then((list: unknown) => {
        if (!Array.isArray(list)) return
        setProducts(current => {
          const next = new Map(current)
          for (const product of list as ProductCardData[]) next.set(product.databaseId, product)
          return next
        })
        setLoadedFor(missing)
      })
      .catch(() => {
        /* aborted or offline: saved data is shown instead */
        if (!controller.signal.aborted) setLoadedFor(missing)
      })
    return () => controller.abort()
  }, [missing])

  // Before hydration localStorage is unknown: avoid flashing the empty state
  if (!mounted) {
    return (
      <div className='flex justify-center py-20'>
        <span role='status' aria-label='লোড হচ্ছে' className='size-8 animate-spin rounded-full border-2 border-line border-t-accent' />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className='rounded-card border border-dashed border-line px-6 py-14 text-center'>
        <span className='mx-auto grid size-16 place-items-center rounded-full bg-surface-2 text-muted'>
          <svg className='icon size-7' aria-hidden='true'>
            <use href='#i-heart' />
          </svg>
        </span>
        <p className='mt-4 font-serif text-xl font-semibold text-ink'>তালিকায় এখনো কিছু নেই</p>
        <p className='mt-2 text-ink-2'>পণ্যের ছবির ওপরের হৃদয় চিহ্নে চাপ দিলে সেটি এখানে জমা থাকবে।</p>
        <Link
          href='/shop'
          className='mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          পণ্য দেখুন
        </Link>
      </div>
    )
  }

  const loading = Boolean(missing) && loadedFor !== missing

  return (
    <ul aria-busy={loading || undefined} className='grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3'>
      {items.map(item => {
        const product = products.get(item.id)
        if (!product && loading) {
          return <li key={item.id} aria-hidden='true' className='aspect-[3/5] animate-pulse rounded-card bg-surface-2' />
        }
        return (
          <li key={item.id} className='flex flex-col gap-2'>
            <div className='flex-1'>{product ? <ProductCard product={product} /> : <SavedCard item={item} />}</div>
            <RemoveButton item={item} />
          </li>
        )
      })}
    </ul>
  )
}
