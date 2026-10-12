import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CartSpinner } from '../../components/cart/CartPage'
import { toFields } from '../../components/account/address'
import AddressBook from '../../components/account/AddressBook'
import { requireCustomer } from '../../components/account/data'

export const metadata: Metadata = {
  title: 'ঠিকানা | লেখনী',
  robots: { index: false, follow: false }
}

export default function Page () {
  return (
    <section>
      <h2 className='mb-5 text-2xl text-ink'>ঠিকানা</h2>
      <Suspense fallback={<CartSpinner />}>
        <Addresses />
      </Suspense>
    </section>
  )
}

async function Addresses () {
  const customer = await requireCustomer('/my-account/addresses')
  return <AddressBook billing={toFields(customer.billing)} shipping={toFields(customer.shipping)} />
}
