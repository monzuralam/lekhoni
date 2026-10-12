'use client'

import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import { useCart } from './CartProvider'
import CartTotals from './CartTotals'
import CouponForm from './CouponForm'
import ShippingOptions from './ShippingOptions'

// Port of design/cart.html (CartPage, CartLineItems, CartTotals). Driven by
// the shared cart context, so it stays in sync with the drawer.

export function CartSpinner () {
  return (
    <div className='flex justify-center py-20'>
      <span
        role='status'
        aria-label='লোড হচ্ছে'
        className='size-8 animate-spin rounded-full border-2 border-line border-t-accent'
      />
    </div>
  )
}

export default function CartPage () {
  const { cart, busyKey, setQuantity, removeItem } = useCart()

  if (!cart) return <CartSpinner />

  if (!cart.items.length) {
    return (
      <section className='mx-auto max-w-lg rounded-card border border-dashed border-line px-6 py-14 text-center'>
        <span className='mx-auto grid size-20 place-items-center rounded-full bg-surface-2 text-muted'>
          <svg className='icon size-9' aria-hidden='true'>
            <use href='#i-cart' />
          </svg>
        </span>
        <h2 className='mt-5 text-2xl text-ink'>আপনার কার্ট এখন খালি</h2>
        <p className='mt-2 text-ink-2'>
          শপ ঘুরে পছন্দের পণ্য কার্টে যোগ করুন। যোগ করা পণ্য এখানে দেখা যাবে।
        </p>
        <Link
          href='/shop'
          className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          শপে যান
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </Link>
      </section>
    )
  }

  return (
    <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]'>
      <section
        aria-labelledby='cart-items-title'
        className='self-start rounded-card border border-line bg-surface px-5 py-2 shadow-soft sm:px-7'
      >
        <h2 id='cart-items-title' className='sr-only'>
          কার্টের পণ্য
        </h2>
        <ul className='divide-y divide-line'>
          {cart.items.map(item => {
            const busy = busyKey === item.key
            return (
              <li
                key={item.key}
                aria-busy={busy || undefined}
                className={`flex flex-wrap items-center gap-4 py-5 transition-opacity sm:flex-nowrap ${busy ? 'opacity-50' : ''}`}
              >
                <Link href={item.uri} tabIndex={-1} aria-hidden='true' className='shrink-0'>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=''
                      width={96}
                      height={96}
                      className='size-24 rounded-xl border border-line bg-surface-2 object-cover'
                    />
                  ) : (
                    <span className='block size-24 rounded-xl border border-line bg-surface-2' />
                  )}
                </Link>
                <div className='min-w-0 flex-1 basis-40'>
                  <Link
                    href={item.uri}
                    className='font-serif text-base font-semibold text-ink transition hover:text-link'
                  >
                    {item.name}
                  </Link>
                  {item.variant && <p className='mt-0.5 text-xs text-muted'>{item.variant}</p>}
                  <p className='mt-1 text-sm text-ink-2'>
                    {item.price} × {bn(item.quantity)}
                  </p>
                </div>
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
                <p className='min-w-20 text-right text-base font-bold text-ink'>{item.subtotal}</p>
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
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-line py-4'>
          <Link
            href='/shop'
            className='-ml-4 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'
          >
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-arrow-left' />
            </svg>
            আরো কেনাকাটা করুন
          </Link>
        </div>
      </section>

      <aside
        aria-labelledby='cart-totals-title'
        className='space-y-5 self-start rounded-card border border-line bg-surface p-6 shadow-soft lg:sticky lg:top-32'
      >
        <h2 id='cart-totals-title' className='text-xl text-ink'>
          অর্ডারের হিসাব
        </h2>
        <CouponForm />
        <ShippingOptions />
        <CartTotals cart={cart} />
        <Link
          href='/checkout'
          className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          চেকআউটে যান
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-arrow-right' />
          </svg>
        </Link>
        <p className='flex items-center justify-center gap-1.5 text-xs text-muted'>
          <svg className='icon size-3.5' aria-hidden='true'>
            <use href='#i-lock' />
          </svg>
          নিরাপদ চেকআউট
        </p>
      </aside>
    </div>
  )
}
