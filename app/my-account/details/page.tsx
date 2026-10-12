import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CartSpinner } from '../../components/cart/CartPage'
import { requireCustomer } from '../../components/account/data'
import DetailsForm from '../../components/account/DetailsForm'

export const metadata: Metadata = {
  title: 'অ্যাকাউন্টের তথ্য | লেখনী',
  robots: { index: false, follow: false }
}

export default function Page () {
  return (
    <section>
      <h2 className='mb-5 text-2xl text-ink'>অ্যাকাউন্টের তথ্য</h2>
      <Suspense fallback={<CartSpinner />}>
        <Details />
      </Suspense>
    </section>
  )
}

async function Details () {
  const customer = await requireCustomer('/my-account/details')
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
  return (
    <DetailsForm
      initial={{
        name,
        displayName: customer.displayName ?? '',
        phone: customer.billing?.phone ?? '',
        email: customer.email ?? ''
      }}
    />
  )
}
