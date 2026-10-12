'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// The design's AccountTabs sidebar; each tab is its own route
const ACCOUNT_TABS = [
  { href: '/my-account', icon: 'grid', label: 'ড্যাশবোর্ড' },
  { href: '/my-account/orders', icon: 'truck', label: 'অর্ডার' },
  { href: '/my-account/addresses', icon: 'map-pin', label: 'ঠিকানা' },
  { href: '/my-account/details', icon: 'user', label: 'অ্যাকাউন্টের তথ্য' },
  { href: '/my-account/wishlist', icon: 'heart', label: 'পছন্দের তালিকা' }
]

function isActive (href: string, pathname: string) {
  // Order details (/my-account/orders/123) keep the Orders tab active
  return href === '/my-account' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

// `pathname` is empty in the Suspense fallback (no tab highlighted yet)
export function AccountNavLinks ({ pathname = '' }: { pathname?: string }) {
  return (
    <ul className='scrollbar-none flex gap-1 overflow-x-auto lg:flex-col'>
      {ACCOUNT_TABS.map(tab => (
        <li key={tab.href} className='shrink-0 lg:w-full'>
          <Link
            href={tab.href}
            aria-current={isActive(tab.href, pathname) ? 'page' : undefined}
            className='flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-[0.95rem] font-medium text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink'
          >
            <svg className='icon size-4.5' aria-hidden='true'>
              <use href={`#i-${tab.icon}`} />
            </svg>
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

// usePathname suspends on /account/orders/[id], so render inside <Suspense>
export default function AccountNav () {
  return <AccountNavLinks pathname={usePathname()} />
}
