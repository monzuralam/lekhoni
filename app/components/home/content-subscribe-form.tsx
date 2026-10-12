'use client'

import { useState, type FormEvent } from 'react'

// Client part of SubscribeBand: the email form (design: form[data-validate]
// in design/home-shop.html). Posts to /api/subscribe, which stores the
// address under Subscribers in wp-admin.

type SubscribeFormProps = {
  id: string
  source: string
  successMessage: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SubscribeForm ({ id, source, successMessage }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const inputId = `${id}-email`
  const errorId = `${inputId}-error`

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    if (!value) return fail('ইমেইল ঠিকানা লিখুন।')
    if (!EMAIL_RE.test(value)) return fail('সঠিক ইমেইল ঠিকানা লিখুন।')

    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source, website })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        fail(String(data.error || 'সাবস্ক্রাইব করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'))
      } else {
        setDone(true)
        setEmail('')
      }
    } catch {
      fail('ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।')
    }
    setPending(false)
  }

  function fail (message: string) {
    setError(message)
    document.getElementById(inputId)?.focus()
  }

  if (done) {
    return (
      <p role='status' className='mt-6 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-3 font-semibold text-ink shadow-soft'>
        <svg className='icon size-5 text-link' aria-hidden='true'>
          <use href='#i-check' />
        </svg>
        {successMessage}
      </p>
    )
  }

  return (
    <form noValidate onSubmit={onSubmit} className='mt-6 flex flex-col gap-3 text-left sm:flex-row sm:items-start'>
      <div className='flex-1'>
        <label htmlFor={inputId} className='sr-only'>
          ইমেইল ঠিকানা
        </label>
        <input
          id={inputId}
          name='email'
          type='email'
          required
          autoComplete='email'
          placeholder='আপনার ইমেইল ঠিকানা'
          value={email}
          onChange={event => {
            setEmail(event.target.value)
            if (error) setError('')
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className='w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20 rounded-full px-5'
        />
        {error && (
          <p id={errorId} role='alert' className='mt-1.5 text-sm font-medium text-danger'>
            {error}
          </p>
        )}
      </div>
      {/* Honeypot: hidden from people and screen readers; bots fill it in */}
      <div aria-hidden='true' className='absolute -left-[9999px] size-px overflow-hidden'>
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name='website'
          type='text'
          tabIndex={-1}
          autoComplete='off'
          value={website}
          onChange={event => setWebsite(event.target.value)}
        />
      </div>
      <button
        type='submit'
        disabled={pending}
        aria-busy={pending || undefined}
        className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 h-[2.875rem] shrink-0 disabled:cursor-wait disabled:opacity-70'
      >
        {pending && (
          <span aria-hidden='true' className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        )}
        সাবস্ক্রাইব করুন
      </button>
    </form>
  )
}
