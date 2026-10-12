import type { Metadata } from 'next'
import PageHeader from '../components/layout/PageHeader'
import CartPage from '../components/cart/CartPage'
import RecentlyViewed from '../components/product/RecentlyViewed'

export const metadata: Metadata = {
  title: 'আপনার কার্ট',
  robots: { index: false }
}

export default function Page () {
  return (
    <>
      <PageHeader
        title='আপনার কার্ট'
        breadcrumbs={[{ label: 'শপ', href: '/shop' }, { label: 'কার্ট' }]}
      />
      <div className='mx-auto mt-10 w-full max-w-site px-4 sm:px-6'>
        <CartPage />
      </div>
      <RecentlyViewed />
    </>
  )
}
