import type { ReactNode } from 'react'
import Link from 'next/link'

type AuthCardProps = {
  icon: 'user' | 'mail' | 'lock'
  title: string
  description: ReactNode
  children?: ReactNode
}

// The centred card shared by the login, register and password pages
export default function AuthCard ({ icon, title, description, children }: AuthCardProps) {
  return (
    <div className='mx-auto w-full max-w-site px-4 sm:px-6 flex justify-center pt-10 sm:pt-16'>
      <section
        aria-labelledby='auth-title'
        className='rounded-card border border-line bg-surface shadow-soft w-full max-w-md p-6 sm:p-9'
      >
        <span className='mx-auto grid size-14 place-items-center rounded-full bg-accent/10 text-link'>
          <svg className='icon size-6' aria-hidden='true'>
            <use href={`#i-${icon}`} />
          </svg>
        </span>
        <h1 id='auth-title' className='mt-4 text-center text-2xl text-ink sm:text-3xl'>
          {title}
        </h1>
        <p className='mt-2 text-center text-[0.95rem] text-ink-2'>{description}</p>
        {children}
      </section>
    </div>
  )
}

export function BackToLogin () {
  return (
    <p className='mt-6 text-center'>
      <Link
        href='/login'
        className='inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-arrow-left' />
        </svg>
        লগইন পাতায় ফিরে যান
      </Link>
    </p>
  )
}
