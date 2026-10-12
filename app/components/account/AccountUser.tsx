import Link from 'next/link'
import { getCustomer } from './data'
import LogoutButton from './LogoutButton'

// Sidebar pieces that depend on the session. Both render inside <Suspense>;
// getCustomer() is cached per request, so WordPress is asked only once.

export async function AccountUserCard () {
  const customer = await getCustomer()
  if (!customer) return null
  const name =
    [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
    customer.displayName ||
    customer.username ||
    ''

  return (
    <div className='mb-4 flex items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-soft max-lg:hidden'>
      <span
        aria-hidden='true'
        className='grid size-12 shrink-0 place-items-center rounded-full bg-accent/10 font-serif text-xl font-bold text-link'
      >
        {name.charAt(0).toUpperCase() || '?'}
      </span>
      <p className='min-w-0'>
        <span className='block truncate font-semibold text-ink'>{name}</span>
        <span className='block truncate text-sm text-muted'>{customer.email}</span>
      </p>
    </div>
  )
}

// Logout for customers; guests (only the wishlist is open to them) get a login link
export async function AccountSessionAction () {
  const customer = await getCustomer()
  if (customer) return <LogoutButton />
  return (
    <Link
      href='/login?next=/my-account'
      className='mt-1 flex items-center gap-3 rounded-xl border-t border-line px-4 py-2.5 text-[0.95rem] font-medium text-link transition hover:bg-accent/10 max-lg:mt-2'
    >
      <svg className='icon size-4.5' aria-hidden='true'>
        <use href='#i-user' />
      </svg>
      লগইন
    </Link>
  )
}
