'use client'

import { useCallback, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '../cart/CartProvider'
import { AUTH_MESSAGES, passwordStrength, safeNext } from './validation'

// Building blocks for the auth forms, with the markup/classes of
// design/login.html, register.html, forgot-password.html and reset-password.html

export const INPUT_CLASS =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'

export const SUBMIT_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 w-full disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100 disabled:active:scale-100 aria-busy:cursor-wait aria-busy:opacity-70'

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange' | 'value'> & {
  id: string
  label: string
  value: string
  error?: string
  hint?: ReactNode
  onValue: (value: string) => void
}

function describedBy (id: string, error?: string, hint?: ReactNode) {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

function FieldMessages ({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className='mt-1.5 text-xs text-muted'>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className='mt-1.5 text-sm font-medium text-danger'>
          {error}
        </p>
      )}
    </>
  )
}

export function TextField ({ id, label, value, error, hint, onValue, ...input }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className='mb-1.5 block text-sm font-medium text-ink'>
        {label}
      </label>
      <input
        {...input}
        id={id}
        name={id}
        value={value}
        onChange={event => onValue(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={INPUT_CLASS}
      />
      <FieldMessages id={id} error={error} hint={hint} />
    </div>
  )
}

// Password input with the design's show/hide toggle
export function PasswordField ({ id, label, value, error, hint, onValue, ...input }: FieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className='mb-1.5 block text-sm font-medium text-ink'>
        {label}
      </label>
      <div className='relative'>
        <input
          {...input}
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onValue(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={`${INPUT_CLASS} pr-12`}
        />
        <button
          type='button'
          aria-pressed={visible}
          aria-label={visible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
          onClick={() => setVisible(v => !v)}
          className='group/eye absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:text-link'
        >
          <svg className='icon size-4.5 group-aria-pressed/eye:hidden' aria-hidden='true'>
            <use href='#i-eye' />
          </svg>
          <svg className='icon size-4.5 hidden group-aria-pressed/eye:block' aria-hidden='true'>
            <use href='#i-eye-off' />
          </svg>
        </button>
      </div>
      <FieldMessages id={id} error={error} hint={hint} />
    </div>
  )
}

const STRENGTH_LABELS = ['', 'দুর্বল', 'মাঝারি', 'শক্তিশালী']

// What a weak password needs; the submit button stays disabled until then
export const WEAK_PASSWORD_HINT = 'আরো শক্ত করুন: বড় ও ছোট হাতের অক্ষর, সংখ্যা বা চিহ্ন (যেমন @ # !) মেশান, অথবা ১২টির বেশি অক্ষর দিন।'

// PasswordStrength meter (same scoring as the design). `id` lets the submit
// button point at it (aria-describedby) while it is disabled.
export function PasswordStrength ({ value, id }: { value: string; id?: string }) {
  const level = passwordStrength(value)

  return (
    <div id={id} data-level={level} className='group/strength -mt-2'>
      <div className='h-1.5 overflow-hidden rounded-full bg-surface-2'>
        <div className='h-full w-0 rounded-full transition-all duration-300 group-data-[level=1]/strength:w-1/3 group-data-[level=1]/strength:bg-danger group-data-[level=2]/strength:w-2/3 group-data-[level=2]/strength:bg-star group-data-[level=3]/strength:w-full group-data-[level=3]/strength:bg-success' />
      </div>
      <p aria-live='polite' className='mt-1 min-h-5 text-xs text-muted'>
        {level ? `পাসওয়ার্ডের মান: ${STRENGTH_LABELS[level]}` : ''}
        {level === 1 && <span className='block font-medium text-danger'>{WEAK_PASSWORD_HINT}</span>}
      </p>
    </div>
  )
}

export function FormError ({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role='alert' className='rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-medium text-danger'>
      {message}
    </p>
  )
}

// `disabled` (e.g. while the new password is weak) with `describedBy`
// pointing at the reason, so screen readers say why it can't be pressed
export function SubmitButton ({
  pending,
  disabled = false,
  describedBy,
  children
}: {
  pending: boolean
  disabled?: boolean
  describedBy?: string
  children: ReactNode
}) {
  return (
    <button
      type='submit'
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      aria-describedby={disabled ? describedBy : undefined}
      className={SUBMIT_CLASS}
    >
      {pending && (
        <span
          aria-hidden='true'
          className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent'
        />
      )}
      {children}
    </button>
  )
}

// Green success panel (forgot-password "email sent", reset "password changed")
export function SuccessPanel ({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      tabIndex={-1}
      role='status'
      ref={node => node?.focus()}
      className='mt-6 rounded-xl border border-success/40 bg-success/10 p-5 text-center focus:outline-none'
    >
      <span className='mx-auto grid size-11 place-items-center rounded-full bg-success/20 text-success'>
        <svg className='icon size-5' aria-hidden='true'>
          <use href='#i-check' />
        </svg>
      </span>
      <p className='mt-3 font-semibold text-ink'>{title}</p>
      {children}
    </div>
  )
}

// POST JSON to /api/auth/*. Resolves to the response body, or { error } with
// a Bangla message (the server's, or a generic network one).
export async function postJson<T extends object> (path: string, body: object): Promise<T | { error: string }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) return { error: String(data.error || AUTH_MESSAGES.serverDown) }
    return data as T
  } catch {
    return { error: AUTH_MESSAGES.network }
  }
}

// After login/register: reload the cart (the guest cart now belongs to the
// customer, so the header badge updates), drop stale server-rendered pages
// from the router cache and go to ?next= (relative paths only) or /account.
export function useFinishSignIn () {
  const router = useRouter()
  const { refresh } = useCart()

  return useCallback(async () => {
    const next = safeNext(new URLSearchParams(window.location.search).get('next'))
    await refresh().catch(() => {})
    router.refresh()
    router.replace(next)
  }, [router, refresh])
}

// Focus the first field with an error after a failed submit
export function focusFirstError (order: string[], errors: Record<string, string | undefined>) {
  const first = order.find(id => errors[id])
  if (first) document.getElementById(first)?.focus()
}
