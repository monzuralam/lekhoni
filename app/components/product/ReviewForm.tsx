'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { bn } from '@/lib/bn'
import { submitReview, type ReviewState } from './actions'

// Port of the design's review form with initFormValidation() messages.
// Submits through the writeReview server action.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_LENGTH = 10

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'

function validate (form: HTMLFormElement) {
  const data = new FormData(form)
  const errors: Record<string, string> = {}
  if (!data.get('rating')) errors.rating = 'একটি অপশন বেছে নিন।'
  const content = String(data.get('content') ?? '').trim()
  if (!content) errors.content = 'এই ঘরটি পূরণ করা আবশ্যক।'
  else if (content.length < MIN_LENGTH) errors.content = `কমপক্ষে ${bn(MIN_LENGTH)}টি অক্ষর লিখুন।`
  if (!String(data.get('author') ?? '').trim()) errors.author = 'এই ঘরটি পূরণ করা আবশ্যক।'
  const email = String(data.get('authorEmail') ?? '').trim()
  if (!email) errors.authorEmail = 'এই ঘরটি পূরণ করা আবশ্যক।'
  else if (!EMAIL_PATTERN.test(email)) errors.authorEmail = 'সঠিক ইমেইল ঠিকানা লিখুন।'
  return errors
}

export default function ReviewForm ({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, { status: 'idle' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const shown = { ...state.errors, ...errors }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const found = validate(e.currentTarget)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (!first) return
    e.preventDefault()
    e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  const clear = (name: string) => {
    if (!errors[name]) return
    setErrors(current => {
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const fieldProps = (name: string) => ({
    name,
    'aria-invalid': shown[name] ? true : undefined,
    'aria-describedby': shown[name] ? `review-${name}-error` : undefined,
    onInput: () => clear(name)
  })

  const error = (name: string) =>
    shown[name] && (
      <p id={`review-${name}-error`} className='mt-1.5 text-sm font-medium text-danger'>
        {shown[name]}
      </p>
    )

  return (
    <section
      aria-labelledby='review-form-title'
      className='mt-6 rounded-card border border-line bg-surface p-6 shadow-soft'
    >
      <h3 id='review-form-title' className='text-xl text-ink'>
        আপনার রিভিউ লিখুন
      </h3>
      <form action={action} onSubmit={onSubmit} noValidate className='mt-5 grid gap-5 sm:grid-cols-2'>
        <input type='hidden' name='productId' value={productId} />
        <fieldset
          className='sm:col-span-2'
          aria-describedby={shown.rating ? 'review-rating-error' : undefined}
        >
          <legend className='mb-1.5 block text-sm font-medium text-ink'>আপনার রেটিং</legend>
          <div className='flex flex-wrap gap-2'>
            {[5, 4, 3, 2, 1].map(value => (
              <label
                key={value}
                className='cursor-pointer rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:border-accent has-checked:border-accent has-checked:bg-accent has-checked:text-accent-ink has-focus-visible:ring-2 has-focus-visible:ring-accent/40'
              >
                <input
                  type='radio'
                  name='rating'
                  value={value}
                  required
                  onChange={() => clear('rating')}
                  className='sr-only'
                />
                {bn(value)} ★
              </label>
            ))}
          </div>
          {error('rating')}
        </fieldset>
        <div className='sm:col-span-2'>
          <label htmlFor='review-text' className='mb-1.5 block text-sm font-medium text-ink'>
            রিভিউ
          </label>
          <textarea
            id='review-text'
            rows={5}
            required
            minLength={MIN_LENGTH}
            className={inputClass}
            {...fieldProps('content')}
          />
          {error('content')}
        </div>
        <div>
          <label htmlFor='review-name' className='mb-1.5 block text-sm font-medium text-ink'>
            নাম
          </label>
          <input
            id='review-name'
            type='text'
            required
            autoComplete='name'
            className={inputClass}
            {...fieldProps('author')}
          />
          {error('author')}
        </div>
        <div>
          <label htmlFor='review-email' className='mb-1.5 block text-sm font-medium text-ink'>
            ইমেইল
          </label>
          <input
            id='review-email'
            type='email'
            required
            autoComplete='email'
            className={inputClass}
            {...fieldProps('authorEmail')}
          />
          {error('authorEmail')}
        </div>
        <div className='flex flex-wrap items-center gap-4 sm:col-span-2'>
          <button
            type='submit'
            disabled={pending}
            aria-busy={pending || undefined}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70'
          >
            {pending && (
              <span
                aria-hidden='true'
                className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
              />
            )}
            {pending ? 'জমা হচ্ছে…' : 'রিভিউ জমা দিন'}
          </button>
          <p
            role='status'
            className={`text-sm font-medium ${state.status === 'error' ? 'text-danger' : 'text-success'}`}
          >
            {!pending && state.message}
          </p>
        </div>
      </form>
    </section>
  )
}
