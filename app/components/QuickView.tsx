'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import {
  discountPercent,
  formatPrice,
  plainText,
  type ProductCardData
} from '@/lib/products'
import { useCart } from './cart/CartProvider'
import { useLayer } from './useLayer'

// Port of initQuickView() from design/assets/js/main.js. The card already
// has every field the dialog shows, so nothing extra is fetched on open.

export default function QuickView ({ product }: { product: ProductCardData }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-haspopup='dialog'
        className='absolute inset-x-3 bottom-3 inline-flex translate-y-2 items-center justify-center gap-1.5 rounded-full bg-surface/95 px-3 py-2 text-xs font-semibold text-ink opacity-0 shadow-soft transition duration-300 hover:text-link focus-visible:translate-y-0 focus-visible:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-eye' />
        </svg>
        এক নজরে দেখুন
      </button>
      {/* Portal: the card's hover transform would otherwise trap this fixed overlay */}
      {open &&
        createPortal(
          <QuickViewDialog product={product} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  )
}

function QuickViewDialog ({ product, onClose }: { product: ProductCardData; onClose: () => void }) {
  const { addItem } = useCart()
  const { overlayProps, initialFocusRef } = useLayer(onClose)
  const [quantity, setQuantity] = useState(1)
  const [pending, setPending] = useState(false)

  const titleId = `quick-title-${product.databaseId}`
  const outOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const canAddToCart = product.__typename === 'SimpleProduct'
  const discount = product.onSale ? discountPercent(product) : null
  const rating = product.averageRating ?? 0
  const reviews = product.reviewCount ?? 0
  const description = plainText(product.shortDescription)
  // Same cap as the design (10), lowered to the tracked stock when known
  const max = Math.max(
    1,
    Math.min(10, product.manageStock && product.stockQuantity != null ? product.stockQuantity : 10)
  )
  const clamp = (value: number) => Math.min(max, Math.max(1, Math.floor(value) || 1))

  const add = async () => {
    setPending(true)
    const added = await addItem(product.databaseId, product.name, quantity)
    setPending(false)
    // The design closes the quick view and opens the cart drawer on success
    if (added) onClose()
  }

  return (
    <div
      {...overlayProps}
      className='fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 print:hidden'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-card border border-line bg-surface shadow-lift animate-pop sm:grid-cols-2 sm:rounded-card'
      >
        <div className='aspect-square bg-surface-2'>
          {product.image?.sourceUrl && (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              width={800}
              height={800}
              sizes='(min-width: 640px) 384px, 100vw'
              className='size-full object-cover'
            />
          )}
        </div>
        <div className='flex flex-col gap-3 p-6'>
          {product.productCategories?.nodes?.[0] && (
            <p className='text-xs font-semibold uppercase tracking-wide text-link'>
              {product.productCategories.nodes[0].name}
            </p>
          )}
          <h2 id={titleId} className='pr-8 text-2xl text-ink'>
            {product.name}
          </h2>
          <div className='flex items-center gap-2'>
            <span className='flex' aria-hidden='true'>
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`icon size-4 ${star <= Math.round(rating) ? 'fill-current text-star' : 'text-line'}`}
                  aria-hidden='true'
                >
                  <use href='#i-star' />
                </svg>
              ))}
            </span>
            <span className='text-sm text-muted'>
              {bn(rating.toFixed(1))} ({bn(reviews)}টি রিভিউ)
            </span>
          </div>
          <p className='flex items-baseline gap-2'>
            {discount ? (
              <>
                <span className='sr-only'>ছাড়ের দাম</span>
                <span className='text-2xl font-bold text-sale'>{formatPrice(product.price)}</span>
                <span className='sr-only'>আগের দাম</span>
                <del className='text-base text-muted'>{formatPrice(product.regularPrice)}</del>
              </>
            ) : (
              <span className='text-2xl font-bold text-ink'>{formatPrice(product.price)}</span>
            )}
          </p>
          {description && <p className='text-sm leading-relaxed text-ink-2'>{description}</p>}

          <div className='mt-auto flex flex-wrap items-center gap-3 pt-3'>
            {outOfStock ? (
              <button
                type='button'
                disabled
                className='inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted'
              >
                স্টক শেষ
              </button>
            ) : canAddToCart ? (
              <>
                <div className='inline-flex items-center rounded-full border border-line'>
                  <button
                    type='button'
                    onClick={() => setQuantity(q => clamp(q - 1))}
                    disabled={quantity <= 1}
                    aria-label='পরিমাণ কমান'
                    className='grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <svg className='icon size-4' aria-hidden='true'>
                      <use href='#i-minus' />
                    </svg>
                  </button>
                  <input
                    type='number'
                    value={quantity}
                    min={1}
                    max={max}
                    inputMode='numeric'
                    aria-label='পরিমাণ'
                    onChange={e => setQuantity(clamp(Number(e.target.value)))}
                    className='w-10 bg-transparent text-center text-sm font-semibold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none'
                  />
                  <button
                    type='button'
                    onClick={() => setQuantity(q => clamp(q + 1))}
                    disabled={quantity >= max}
                    aria-label='পরিমাণ বাড়ান'
                    className='grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <svg className='icon size-4' aria-hidden='true'>
                      <use href='#i-plus' />
                    </svg>
                  </button>
                </div>
                <button
                  type='button'
                  onClick={add}
                  disabled={pending}
                  aria-busy={pending || undefined}
                  className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70'
                >
                  {pending ? (
                    <span
                      aria-hidden='true'
                      className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
                    />
                  ) : (
                    <svg className='icon size-4' aria-hidden='true'>
                      <use href='#i-cart' />
                    </svg>
                  )}
                  {pending ? 'যোগ হচ্ছে…' : 'কার্টে যোগ করুন'}
                </button>
              </>
            ) : (
              <Link
                href={product.uri}
                className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110'
              >
                অপশন বেছে নিন
              </Link>
            )}
          </div>
          <Link
            href={product.uri}
            className='inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline'
          >
            বিস্তারিত দেখুন
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-arrow-right' />
            </svg>
          </Link>
        </div>
        <button
          ref={initialFocusRef}
          type='button'
          onClick={onClose}
          aria-label='বন্ধ করুন'
          className='absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-soft transition hover:text-link'
        >
          <svg className='icon size-5' aria-hidden='true'>
            <use href='#i-close' />
          </svg>
        </button>
      </div>
    </div>
  )
}
