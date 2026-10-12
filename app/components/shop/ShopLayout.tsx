import Link from 'next/link'
import { bn } from '@/lib/bn'
import ProductCard from '../ProductCard'
import Pagination from './Pagination'
import ShopFilters from './ShopFilters'
import SortSelect from './SortSelect'
import { ShopGrid, ViewToggle } from './ShopView'
import {
  SORT_OPTIONS,
  getShopCatalog,
  getShopPage,
  parseShopParams,
  shopHref
} from './shop-data'

// design/shop.html <div data-shop>: filter sidebar + toolbar, grid and
// pagination. Shared by /shop and /product-category/[...slug]. It reads
// searchParams, so render it inside <Suspense> (see ShopSkeleton).

type ShopLayoutProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  basePath: string // '/shop' or the category path
  baseCategory?: string // category page: its slug is always selected
}

export default async function ShopLayout ({ searchParams, basePath, baseCategory }: ShopLayoutProps) {
  const [params, catalog] = await Promise.all([searchParams, getShopCatalog()])
  const filters = parseShopParams(params, baseCategory)
  const { products, total, totalPages } = await getShopPage(filters, catalog)

  const href = (overrides: Parameters<typeof shopHref>[3]) => shopHref(basePath, filters, baseCategory, overrides)
  const resetHref = basePath

  // Hidden fields for the sort form: current filters minus sort and page
  const hidden = [...new URLSearchParams(href({ sort: 'default', page: 1 }).split('?')[1] ?? '')]
  const shown = products.length

  return (
    <div data-shop className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]'>
      {/* COMPONENT: ShopFilters | WooGraphQL: productCategories + products(where: { categoryIn, minPrice, maxPrice, stockStatus }) */}
      <ShopFilters
        categories={catalog.categories.map(({ slug, name, count, depth }) => ({ slug, name, count, depth }))}
        selected={filters.categories}
        baseCategory={baseCategory}
        basePath={basePath}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        inStock={filters.inStock}
        sort={filters.sort}
        priceMax={catalog.priceMax}
        priceStep={catalog.priceStep}
        currency={catalog.currency}
        resetHref={resetHref}
      />
      <section aria-label='পণ্যের তালিকা'>
        {/* COMPONENT: ShopToolbar | WooGraphQL: products(where: { orderby: [{ field, order }] }) */}
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface px-4 py-3'>
          <p aria-live='polite' className='text-sm text-ink-2'>
            {total > shown && shown > 0 && <>মোট {bn(total)}টির মধ্যে </>}
            <span data-shop-count className='font-semibold text-ink'>
              {bn(shown)}
            </span>
            টি পণ্য দেখানো হচ্ছে
          </p>
          <div className='flex items-center gap-3'>
            <SortSelect
              action={basePath}
              value={filters.sort}
              options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
              hidden={hidden}
            />
            <ViewToggle />
          </div>
        </div>

        {/* COMPONENT: ProductGrid | WooGraphQL: ids first, then products(where: { include: $pageIds }) { ...ProductCardFields } */}
        {shown > 0 ? (
          <ShopGrid>
            {products.map(product => (
              <ProductCard key={product.databaseId} product={product} />
            ))}
          </ShopGrid>
        ) : (
          <div data-shop-empty className='rounded-card border border-dashed border-line p-10 text-center'>
            <p className='font-serif text-xl font-semibold text-ink'>কোনো পণ্য মেলেনি</p>
            <p className='mt-2 text-ink-2'>
              {total > 0 ? 'এই পৃষ্ঠায় কোনো পণ্য নেই।' : 'ফিল্টার একটু শিথিল করে আবার দেখুন।'}
            </p>
            <Link
              href={total > 0 ? href({ page: 1 }) : resetHref}
              data-shop-reset
              className='inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-link active:scale-95 mt-5'
            >
              {total > 0 ? 'প্রথম পৃষ্ঠায় যান' : 'সব ফিল্টার মুছুন'}
            </Link>
          </div>
        )}

        <Pagination page={filters.page} totalPages={totalPages} href={page => href({ page })} />
      </section>
    </div>
  )
}

// Suspense fallback with the same grid so the layout does not jump
export function ShopSkeleton () {
  return (
    <div aria-busy='true' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]'>
      <div className='hidden space-y-6 lg:block'>
        {[0, 1, 2].map(n => (
          <div key={n} className='h-40 animate-pulse rounded-card border border-line bg-surface-2' />
        ))}
      </div>
      <div>
        <div className='mb-6 h-16 animate-pulse rounded-card border border-line bg-surface-2' />
        <div className='grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3'>
          {[0, 1, 2, 3, 4, 5].map(n => (
            <div key={n} className='aspect-[3/5] animate-pulse rounded-card border border-line bg-surface-2' />
          ))}
        </div>
      </div>
    </div>
  )
}
