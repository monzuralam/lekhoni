import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { CartSpinner } from '../../components/cart/CartPage'
import { getOrders, requireCustomer } from '../../components/account/data'
import OrdersTable from '../../components/account/OrdersTable'

export const metadata: Metadata = {
  title: 'আমার অর্ডার | লেখনী',
  robots: { index: false, follow: false }
}

export default function Page () {
  return (
    <section>
      <h2 className='mb-5 text-2xl text-ink'>আমার অর্ডার</h2>
      <Suspense fallback={<CartSpinner />}>
        <Orders />
      </Suspense>
    </section>
  )
}

async function Orders () {
  await requireCustomer('/my-account/orders')
  const page = await getOrders()

  if (!page) {
    return (
      <p role='alert' className='rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm font-medium text-danger'>
        অর্ডারগুলো আনা যায়নি। পাতাটি আবার লোড করে দেখুন।
      </p>
    )
  }

  if (!page.orders.length) {
    return (
      <div className='rounded-card border border-dashed border-line px-6 py-14 text-center'>
        <span className='mx-auto grid size-16 place-items-center rounded-full bg-surface-2 text-muted'>
          <svg className='icon size-7' aria-hidden='true'>
            <use href='#i-truck' />
          </svg>
        </span>
        <p className='mt-4 font-serif text-xl font-semibold text-ink'>এখনো কোনো অর্ডার করেননি</p>
        <p className='mt-2 text-ink-2'>পছন্দের পণ্য কার্টে নিয়ে অর্ডার করলে সেটি এখানে দেখা যাবে।</p>
        <Link
          href='/shop'
          className='mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
        >
          কেনাকাটা শুরু করুন
        </Link>
      </div>
    )
  }

  return <OrdersTable initial={page.orders} hasNextPage={page.hasNextPage} endCursor={page.endCursor} />
}
