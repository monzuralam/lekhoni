import { Suspense } from 'react'
import PageHeader from '../components/layout/PageHeader'
import AccountNav, { AccountNavLinks } from '../components/account/AccountNav'
import { AccountSessionAction, AccountUserCard } from '../components/account/AccountUser'

// Port of design/account.html: PageHeader + the AccountTabs sidebar. Each tab
// is a route under /account; the session-dependent parts stream in.

export default function AccountLayout ({ children }: LayoutProps<'/my-account'>) {
  return (
    <>
      <PageHeader title='আমার অ্যাকাউন্ট' breadcrumbs={[{ label: 'আমার অ্যাকাউন্ট' }]} />
      <div className='mx-auto mt-10 grid w-full max-w-site gap-8 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)]'>
        <aside className='min-w-0 self-start lg:sticky lg:top-32'>
          <Suspense fallback={null}>
            <AccountUserCard />
          </Suspense>
          <nav aria-label='অ্যাকাউন্ট মেনু' className='rounded-card border border-line bg-surface p-2 shadow-soft'>
            <Suspense fallback={<AccountNavLinks />}>
              <AccountNav />
            </Suspense>
            <Suspense fallback={null}>
              <AccountSessionAction />
            </Suspense>
          </nav>
        </aside>
        <div className='min-w-0'>{children}</div>
      </div>
    </>
  )
}
