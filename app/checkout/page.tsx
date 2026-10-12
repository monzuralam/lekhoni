import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHeader from '../components/layout/PageHeader'
import CheckoutForm from '../components/checkout/CheckoutForm'
import { CartSpinner } from '../components/cart/CartPage'
import { getPaymentGateways, type Gateway } from '../components/checkout/gateways'
import { getCustomer } from '../components/account/data'
import { savedAddressFields } from '../components/account/address'

export const metadata: Metadata = {
  title: 'চেকআউট',
  robots: { index: false }
}

// A signed-in customer's saved name and address fill the form (reads the
// auth cookies, hence the Suspense boundary)
async function Checkout ({ gateways }: { gateways: Gateway[] }) {
  const saved = savedAddressFields(await getCustomer())
  return <CheckoutForm gateways={gateways} saved={saved} />
}

export default async function Page () {
  const gateways = await getPaymentGateways()

  return (
    <>
      <PageHeader
        title='চেকআউট'
        breadcrumbs={[{ label: 'কার্ট', href: '/cart' }, { label: 'চেকআউট' }]}
      />
      <div className='mx-auto mt-10 w-full max-w-site px-4 sm:px-6'>
        <Suspense fallback={<CartSpinner />}>
          <Checkout gateways={gateways} />
        </Suspense>
      </div>
    </>
  )
}
