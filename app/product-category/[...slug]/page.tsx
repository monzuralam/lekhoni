import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { plainText } from '@/lib/products'
import PageHeader from '../../components/layout/PageHeader'
import ShopLayout, { ShopSkeleton } from '../../components/shop/ShopLayout'
import { categoryPath, getAllCategoryPaths, getCategoryByPath } from '../../components/shop/shop-data'

// Category archive, e.g. /product-category/clothing/accessories. Same layout
// as /shop (design/shop.html) with the category preselected. The category is
// resolved from a cached lookup before anything streams, so unknown slugs get
// a real 404 status.

export async function generateStaticParams () {
  return (await getAllCategoryPaths()).map(slug => ({ slug }))
}

export async function generateMetadata ({ params }: PageProps<'/product-category/[...slug]'>): Promise<Metadata> {
  const found = await getCategoryByPath((await params).slug)
  if (!found) return { title: 'ক্যাটাগরি পাওয়া যায়নি | লেখনী' }
  const { category } = found
  const description =
    plainText(category.description) || `${category.name} ক্যাটাগরির সব পণ্য, ফিল্টার ও সাজানোর সুবিধাসহ। লেখনী শপ।`
  return {
    title: `${category.name} | লেখনী`,
    description,
    openGraph: { title: `${category.name} | লেখনী`, description, type: 'website', locale: 'bn_BD', siteName: 'লেখনী' }
  }
}

export default async function ProductCategoryPage ({ params, searchParams }: PageProps<'/product-category/[...slug]'>) {
  const found = await getCategoryByPath((await params).slug)
  if (!found) notFound()
  const { category, ancestors } = found
  const description = plainText(category.description)

  return (
    <>
      <PageHeader
        title={category.name}
        breadcrumbs={[
          { label: 'শপ', href: '/shop' },
          ...ancestors.map(ancestor => ({ label: ancestor.name, href: categoryPath(ancestor.uri) })),
          { label: category.name }
        ]}
        description={description || undefined}
      />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopLayout searchParams={searchParams} basePath={categoryPath(category.uri)} baseCategory={category.slug} />
      </Suspense>
    </>
  )
}
