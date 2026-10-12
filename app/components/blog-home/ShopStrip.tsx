import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { PRODUCT_CARD_FRAGMENT, type ProductCardData } from '@/lib/products'
import ProductCard from '../ProductCard'

// COMPONENT: ShopStrip (design/index.html). Four featured products
// (Products > ★), else the four best sellers. Hidden when the shop is empty.

async function getStripProducts (): Promise<ProductCardData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('products')
  const data = await wpQuery(`
    ${PRODUCT_CARD_FRAGMENT}
    {
      featured: products(first: 4, where: { featured: true }) {
        nodes {
          ...ProductCardFields
        }
      }
      popular: products(first: 4, where: { orderby: [{ field: POPULARITY, order: DESC }] }) {
        nodes {
          ...ProductCardFields
        }
      }
    }
  `)
  const featured: ProductCardData[] = data?.featured?.nodes ?? []
  return featured.length ? featured : data?.popular?.nodes ?? []
}

export default async function ShopStrip () {
  const products = await getStripProducts().catch(() => [])
  if (!products.length) return null

  return (
    <section aria-labelledby='shop-strip-title' className='mt-16 border-y border-line bg-surface-2/60 py-12'>
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <h2 id='shop-strip-title' className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
            <span className='grid size-9 place-items-center rounded-full bg-accent/10 text-link'>
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-gift' />
              </svg>
            </span>
            শপ থেকে
          </h2>
          <Link href='/shop' className='inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link hover:underline'>
            পুরো শপ দেখুন
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-arrow-right' />
            </svg>
          </Link>
        </div>
        <ul className='grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4'>
          {products.map(product => (
            <li key={product.databaseId}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
