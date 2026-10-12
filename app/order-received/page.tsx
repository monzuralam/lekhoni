import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CartSpinner } from '../components/cart/CartPage'
import OrderReceived from '../components/checkout/OrderReceived'

export const metadata: Metadata = {
  title: 'অর্ডার সম্পন্ন হয়েছে',
  robots: { index: false }
}

export default function Page ({ searchParams }: PageProps<'/order-received'>) {
  return (
    <div className='mx-auto w-full max-w-site px-4 pt-10 sm:px-6 sm:pt-14'>
      {/* Reads the order cookie and the query string, so it renders per request */}
      <Suspense fallback={<CartSpinner />}>
        <OrderReceived searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
