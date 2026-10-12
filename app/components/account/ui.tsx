import type { ReactNode } from 'react'

// Shared form pieces for the account forms (same classes as the design and
// the checkout form)

export const INPUT =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base text-ink transition placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20'
export const CARD = 'rounded-card border border-line bg-surface shadow-soft'
export const BUTTON_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70'
export const BUTTON_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'

export function Field ({
  id,
  label,
  error,
  className = '',
  children
}: {
  id: string
  label: ReactNode
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className='mb-1.5 block text-sm font-medium text-ink'>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className='mt-1.5 text-sm font-medium text-danger'>
          {error}
        </p>
      )}
    </div>
  )
}

export const optional = <span className='font-normal text-muted'>(ঐচ্ছিক)</span>

export function FormMessage ({ type, children }: { type: 'success' | 'error'; children: ReactNode }) {
  return type === 'success' ? (
    <p role='status' className='flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-medium text-success'>
      <svg className='icon size-4 shrink-0' aria-hidden='true'>
        <use href='#i-check' />
      </svg>
      {children}
    </p>
  ) : (
    <p role='alert' className='rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-medium text-danger'>
      {children}
    </p>
  )
}
