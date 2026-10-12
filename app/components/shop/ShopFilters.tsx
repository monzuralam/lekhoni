'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type FormEvent } from 'react'
import { bn } from '@/lib/bn'

// COMPONENT: ShopFilters (design/shop.html <aside aria-label="পণ্য ফিল্টার">)
// A plain GET form to /shop, so it works without JS via the <noscript>
// submit button. With JS, every change replaces the URL straight away (the
// price slider is debounced) and the server re-renders the grid.

type Category = { slug: string; name: string; count: number; depth: number }

type ShopFiltersProps = {
  categories: Category[]
  selected: string[] // category slugs, including the category page's own
  baseCategory?: string // set on /product-category/... pages
  basePath: string
  maxPrice: number | null
  minPrice: number | null
  inStock: boolean
  sort: string
  priceMax: number
  priceStep: number
  currency: string
  resetHref: string
}

export default function ShopFilters (props: ShopFiltersProps) {
  const { categories, baseCategory, basePath, minPrice, sort, priceMax, priceStep, currency, resetHref } = props
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Local copy of the URL state so inputs respond instantly; reset whenever
  // the URL changes (back button, reset link, pagination).
  const urlState = JSON.stringify([props.selected, props.maxPrice, props.inStock])
  const [synced, setSynced] = useState(urlState)
  const [selected, setSelected] = useState(props.selected)
  const [price, setPrice] = useState(Math.min(props.maxPrice ?? priceMax, priceMax))
  const [inStock, setInStock] = useState(props.inStock)
  if (synced !== urlState) {
    setSynced(urlState)
    setSelected(props.selected)
    setPrice(Math.min(props.maxPrice ?? priceMax, priceMax))
    setInStock(props.inStock)
  }

  function navigate (next: { selected?: string[]; price?: number; inStock?: boolean }) {
    const chosen = next.selected ?? selected
    const max = next.price ?? price
    const stock = next.inStock ?? inStock

    // Staying on the category page while its own category is ticked;
    // unticking it falls back to /shop with the remaining filters.
    const onBase = !!baseCategory && chosen.includes(baseCategory)
    const params = new URLSearchParams()
    chosen.filter(slug => !onBase || slug !== baseCategory).forEach(slug => params.append('category', slug))
    if (minPrice != null) params.set('minPrice', String(minPrice))
    if (max < priceMax) params.set('maxPrice', String(max))
    if (stock) params.set('inStock', '1')
    if (sort !== 'default') params.set('sort', sort)
    const query = params.toString()
    const path = onBase ? basePath : '/shop'
    startTransition(() => router.push(query ? `${path}?${query}` : path, { scroll: false }))
  }

  function toggleCategory (slug: string, checked: boolean) {
    const next = checked ? [...selected, slug] : selected.filter(item => item !== slug)
    setSelected(next)
    navigate({ selected: next })
  }

  function changePrice (value: number) {
    setPrice(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => navigate({ price: value }), 400)
  }

  function submit (event: FormEvent) {
    event.preventDefault()
    navigate({})
  }

  const money = (value: number) => `${currency}${bn(value.toLocaleString('en-US'))}`

  return (
    <aside aria-label='পণ্য ফিল্টার' className='self-start lg:sticky lg:top-32 print:hidden'>
      <button
        type='button'
        data-toggle-open='#shop-filters'
        aria-expanded={open}
        aria-controls='shop-filters'
        onClick={() => setOpen(!open)}
        className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 w-full lg:hidden'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-filter' />
        </svg>
        {open ? 'ফিল্টার লুকান' : 'ফিল্টার দেখুন'}
      </button>
      <form
        id='shop-filters'
        action='/shop'
        method='get'
        onSubmit={submit}
        data-open={open ? '' : undefined}
        className='space-y-6 max-lg:mt-4 max-lg:hidden max-lg:data-open:block'
      >
        {minPrice != null && <input type='hidden' name='minPrice' value={minPrice} />}
        {sort !== 'default' && <input type='hidden' name='sort' value={sort} />}

        {categories.length > 0 && (
          <section className='rounded-card border border-line bg-surface shadow-soft p-5'>
            <h2 className='mb-3 text-lg text-ink'>ক্যাটাগরি</h2>
            <ul className='space-y-0.5'>
              {categories.map(category => (
                <li key={category.slug} style={category.depth ? { paddingInlineStart: `${category.depth * 1.25}rem` } : undefined}>
                  <label className='flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[0.95rem] text-ink-2 transition hover:bg-surface-2'>
                    <input
                      type='checkbox'
                      name='category'
                      data-shop-category
                      value={category.slug}
                      checked={selected.includes(category.slug)}
                      onChange={event => toggleCategory(category.slug, event.target.checked)}
                      className='size-4 rounded accent-accent'
                    />
                    <span className='flex-1'>{category.name}</span>
                    <span className='text-xs text-muted'>{bn(category.count)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='rounded-card border border-line bg-surface shadow-soft p-5'>
          <h2 className='mb-3 text-lg text-ink'>দাম</h2>
          <label htmlFor='shop-price' className='flex items-center justify-between text-sm text-ink-2'>
            সর্বোচ্চ দাম
            <output data-shop-price-label htmlFor='shop-price' className='font-semibold text-ink'>
              {money(price)}
            </output>
          </label>
          <input
            id='shop-price'
            type='range'
            name='maxPrice'
            data-shop-price
            min={0}
            max={priceMax}
            step={priceStep}
            value={price}
            onChange={event => changePrice(Number(event.target.value))}
            className='mt-3 w-full accent-accent'
          />
          <p className='mt-1 flex justify-between text-xs text-muted'>
            <span>{money(0)}</span>
            <span>{money(priceMax)}</span>
          </p>
        </section>

        <section className='rounded-card border border-line bg-surface shadow-soft p-5'>
          <h2 className='mb-3 text-lg text-ink'>স্টক</h2>
          <label className='flex cursor-pointer items-center justify-between gap-3 text-[0.95rem] text-ink-2'>
            শুধু স্টকে থাকা পণ্য
            <input
              type='checkbox'
              name='inStock'
              value='1'
              data-shop-instock
              checked={inStock}
              onChange={event => {
                setInStock(event.target.checked)
                navigate({ inStock: event.target.checked })
              }}
              className='peer sr-only'
            />
            <span
              aria-hidden='true'
              className='relative h-6 w-11 shrink-0 rounded-full bg-line transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-soft after:transition peer-checked:bg-accent peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40'
            />
          </label>
        </section>

        <noscript>
          <button
            type='submit'
            className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110'
          >
            ফিল্টার প্রয়োগ করুন
          </button>
        </noscript>

        <Link
          href={resetHref}
          scroll={false}
          data-shop-reset
          className='inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10 w-full'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-rotate-ccw' />
          </svg>
          সব ফিল্টার মুছুন
        </Link>
      </form>
    </aside>
  )
}
