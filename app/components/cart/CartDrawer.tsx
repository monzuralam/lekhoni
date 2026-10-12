'use client'

import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import { useCart } from './CartProvider'
import { useLayer } from '../useLayer'

// Port of openCartDrawer() / drawerBodyHTML() from design/assets/js/main.js,
// with the shared openLayer() behaviour from useLayer().

export default function CartDrawer () {
  const { cart, busyKey, close, setQuantity, removeItem } = useCart()
  const { overlayProps, initialFocusRef } = useLayer(close)

  const items = cart?.items ?? []

  return (
    <div
      {...overlayProps}
      className='fixed inset-0 z-[70] flex justify-end bg-black/50 print:hidden'
    >
      <aside
        role='dialog'
        aria-modal='true'
        aria-label='শপিং কার্ট'
        className='flex h-full w-full max-w-md flex-col bg-surface shadow-lift animate-slide-in'
      >
        <header className='flex items-center justify-between border-b border-line px-5 py-4'>
          <h2 className='flex items-center gap-2 text-lg text-ink'>
            <svg className='icon size-5 text-link' aria-hidden='true'>
              <use href='#i-cart' />
            </svg>
            আপনার কার্ট{' '}
            <span className='font-sans text-sm font-normal text-muted'>
              ({bn(cart?.count ?? 0)}টি)
            </span>
          </h2>
          <button
            ref={initialFocusRef}
            type='button'
            onClick={close}
            aria-label='কার্ট বন্ধ করুন'
            className='grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link'
          >
            <svg className='icon size-5' aria-hidden='true'>
              <use href='#i-close' />
            </svg>
          </button>
        </header>

        <div className='flex min-h-0 flex-1 flex-col'>
          {!cart ? (
            <div className='flex flex-1 items-center justify-center p-8'>
              <span
                aria-label='লোড হচ্ছে'
                className='size-8 animate-spin rounded-full border-2 border-line border-t-accent'
              />
            </div>
          ) : !items.length ? (
            <div className='flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center'>
              <span className='grid size-20 place-items-center rounded-full bg-surface-2 text-muted'>
                <svg className='icon size-9' aria-hidden='true'>
                  <use href='#i-cart' />
                </svg>
              </span>
              <p className='font-serif text-xl font-semibold text-ink'>আপনার কার্ট খালি</p>
              <p className='text-sm text-ink-2'>পছন্দের পণ্য কার্টে যোগ করুন, এখানে দেখা যাবে।</p>
              <Link
                href='/shop'
                onClick={close}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110'
              >
                শপে যান
              </Link>
            </div>
          ) : (
            <>
              <ul className='flex-1 divide-y divide-line overflow-y-auto px-5'>
                {items.map(item => {
                  const busy = busyKey === item.key
                  return (
                    <li
                      key={item.key}
                      aria-busy={busy || undefined}
                      className={`flex gap-3 py-4 transition-opacity ${busy ? 'opacity-50' : ''}`}
                    >
                      <Link href={item.uri} onClick={close} tabIndex={-1} aria-hidden='true' className='shrink-0'>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt=''
                            width={72}
                            height={72}
                            className='size-18 rounded-xl border border-line bg-surface-2 object-cover'
                          />
                        ) : (
                          <span className='block size-18 rounded-xl border border-line bg-surface-2' />
                        )}
                      </Link>
                      <div className='min-w-0 flex-1'>
                        <Link
                          href={item.uri}
                          onClick={close}
                          className='line-clamp-2 text-sm font-semibold leading-snug text-ink transition hover:text-link'
                        >
                          {item.name}
                        </Link>
                        {item.variant && <p className='mt-0.5 text-xs text-muted'>{item.variant}</p>}
                        <div className='mt-2 flex items-center justify-between gap-2'>
                          <div className='inline-flex items-center rounded-full border border-line bg-surface'>
                            <button
                              type='button'
                              disabled={busy || item.quantity <= 1}
                              onClick={() => setQuantity(item.key, item.quantity - 1)}
                              aria-label='পরিমাণ কমান'
                              className='grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
                            >
                              <svg className='icon size-3.5' aria-hidden='true'>
                                <use href='#i-minus' />
                              </svg>
                            </button>
                            <span className='min-w-7 text-center text-sm font-semibold text-ink' aria-label='পরিমাণ'>
                              {bn(item.quantity)}
                            </span>
                            <button
                              type='button'
                              disabled={busy}
                              onClick={() => setQuantity(item.key, item.quantity + 1)}
                              aria-label='পরিমাণ বাড়ান'
                              className='grid size-8 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
                            >
                              <svg className='icon size-3.5' aria-hidden='true'>
                                <use href='#i-plus' />
                              </svg>
                            </button>
                          </div>
                          <span className='text-sm font-bold text-ink'>{item.total}</span>
                        </div>
                      </div>
                      <button
                        type='button'
                        disabled={busy}
                        onClick={() => removeItem(item.key, item.name)}
                        aria-label={`${item.name} সরিয়ে ফেলুন`}
                        className='grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed'
                      >
                        <svg className='icon size-4' aria-hidden='true'>
                          <use href='#i-trash' />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className='space-y-3 border-t border-line bg-surface-2 p-5'>
                <p className='flex items-center justify-between text-base'>
                  <span className='text-ink-2'>সাবটোটাল</span>
                  <strong className='font-bold text-ink'>{cart.subtotal}</strong>
                </p>
                <p className='text-xs text-muted'>ডেলিভারি চার্জ ও কুপন চেকআউটে হিসাব হবে।</p>
                <div className='grid grid-cols-2 gap-3'>
                  <Link
                    href='/cart'
                    onClick={close}
                    className='inline-flex items-center justify-center rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link'
                  >
                    কার্ট দেখুন
                  </Link>
                  <Link
                    href='/checkout'
                    onClick={close}
                    className='inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110'
                  >
                    চেকআউট
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
