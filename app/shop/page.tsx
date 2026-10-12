import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHeader from '../components/layout/PageHeader'
import ShopLayout, { ShopSkeleton } from '../components/shop/ShopLayout'

// Port of design/shop.html. The header is static; filters, sort and page
// come from the URL, so the shop body streams in under <Suspense>.

const description = 'লেখনী শপের সব পণ্য: নোটবুক, কলম, মগ, ব্যাগ, স্টিকার ও গিফট বক্স। ফিল্টার ও সাজানোর সুবিধাসহ।'

export const metadata: Metadata = {
  title: 'শপ | লেখনী',
  description,
  openGraph: { title: 'শপ | লেখনী', description, type: 'website', locale: 'bn_BD', siteName: 'লেখনী' }
}

export default function ShopPage ({ searchParams }: PageProps<'/shop'>) {
  return (
    <>
      <PageHeader
        title='শপ'
        breadcrumbs={[{ label: 'শপ' }]}
        description='লেখালেখির প্রিয় জিনিসপত্র: নোটবুক, কলম, মগ, ব্যাগ আর উপহার।'
      />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopLayout searchParams={searchParams} basePath='/shop' />
      </Suspense>
    </>
  )
}
