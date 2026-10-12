'use client'

import { useId, useState, type FormEvent } from 'react'
import { useCart } from './CartProvider'

// Port of the design's CouponForm (cart page and checkout summary), backed by
// WooGraphQL applyCoupon / removeCoupons through /api/cart/coupon.
export default function CouponForm () {
  const { cart, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const id = useId()
  const coupons = cart?.coupons ?? []

  async function submit (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = code.trim()
    if (!value) {
      setError('কুপন কোড লিখুন।')
      return
    }
    setPending(true)
    const message = await applyCoupon(value)
    setPending(false)
    setError(message ?? '')
    if (!message) setCode('')
  }

  return (
    <div>
      {coupons.map(coupon => (
        <p
          key={coupon.code}
          className='mb-2 flex items-center justify-between gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success'
        >
          <span className='inline-flex items-center gap-1.5'>
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-tag' />
            </svg>
            কুপন <span className='uppercase'>{coupon.code}</span> প্রয়োগ হয়েছে
          </span>
          <button
            type='button'
            onClick={() => removeCoupon(coupon.code)}
            className='font-semibold underline underline-offset-2'
          >
            সরান
          </button>
        </p>
      ))}
      <form onSubmit={submit} noValidate className='flex gap-2'>
        <label htmlFor={`${id}-coupon`} className='sr-only'>
          কুপন কোড
        </label>
        <input
          id={`${id}-coupon`}
          type='text'
          autoComplete='off'
          placeholder='কুপন কোড'
          value={code}
          onChange={event => {
            setCode(event.target.value)
            if (error) setError('')
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-coupon-error` : undefined}
          className='w-full min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm uppercase text-ink transition placeholder:normal-case placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'
        />
        <button
          type='submit'
          disabled={pending}
          className='inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 disabled:cursor-wait disabled:opacity-60'
        >
          {pending ? 'অপেক্ষা করুন…' : 'প্রয়োগ'}
        </button>
      </form>
      {error && (
        <p id={`${id}-coupon-error`} role='alert' className='mt-1.5 text-sm font-medium text-danger'>
          {error}
        </p>
      )}
    </div>
  )
}
