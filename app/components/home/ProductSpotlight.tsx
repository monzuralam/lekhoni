import Link from 'next/link'
import { bn } from '@/lib/bn'
import { ProductPrice } from '../product/ProductPrice'
import ProductPurchase from '../product/ProductPurchase'
import { Stars } from '../product/ProductReviews'
import ProductSelection from '../product/ProductSelection'
import { findVariation, variantAttributes } from '../product/utils'
import SpotlightImage from './products-spotlight-image'
import { getSpotlight } from './products-data'

// Port of the ProductSpotlight section of design/home-shop.html. The product
// is picked in ACF "Home Products" → Product Spotlight; when empty it is the
// best-selling in-stock variable product (else any in-stock product). The
// section is hidden when there is no product. Variant picker, quantity and
// add to cart reuse the product page components.

export default async function ProductSpotlight () {
  const spotlight = await getSpotlight()
  if (!spotlight) return null
  const { eyebrow, highlights, product } = spotlight

  const variations = product.variations?.nodes ?? []
  const attributes = variantAttributes(product.attributes?.nodes ?? [], variations)
  const isVariable = product.__typename === 'VariableProduct'
  const defaultSelection = Object.fromEntries(
    (product.defaultAttributes?.nodes ?? [])
      .filter(item => item.value)
      .map(item => [item.name, item.value])
  )
  const initialVariation = isVariable
    ? findVariation(variations, attributes, defaultSelection)
    : null
  const canBuyHere = product.__typename === 'SimpleProduct' || isVariable
  const rating = product.averageRating ?? 0
  const reviewCount = product.reviewCount ?? 0

  return (
    <section
      aria-labelledby='spotlight-title'
      className='mx-auto mt-16 w-full max-w-site px-4 sm:px-6'
    >
      <ProductSelection initial={initialVariation}>
        <div className='grid items-center gap-8 overflow-hidden rounded-card border border-line bg-surface p-6 shadow-soft sm:p-10 lg:grid-cols-2'>
          <SpotlightImage image={product.image} name={product.name} />
          <div className='flex flex-col gap-4'>
            <p className='inline-flex w-fit items-center gap-1.5 rounded-full bg-star/20 px-3 py-1 text-xs font-semibold text-ink'>
              <svg className='icon size-3.5 fill-current text-star' aria-hidden='true'>
                <use href='#i-star' />
              </svg>
              {eyebrow}
            </p>
            <h2 id='spotlight-title' className='text-3xl text-ink sm:text-4xl'>
              <Link href={product.uri} className='transition hover:text-link'>
                {product.name}
              </Link>
            </h2>
            {reviewCount > 0 && (
              <div className='flex items-center gap-2'>
                <Stars rating={rating} />
                <span className='text-sm text-muted'>
                  {bn(rating.toFixed(1))} ({bn(reviewCount)}টি রিভিউ)
                </span>
              </div>
            )}

            <ProductPrice
              product={{
                price: product.price,
                regularPrice: product.regularPrice,
                rawPrice: product.rawPrice,
                rawRegularPrice: product.rawRegularPrice
              }}
            />

            {product.shortDescription && (
              <div
                className='text-[0.95rem] leading-relaxed text-ink-2 [&_p]:m-0'
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            {highlights.length > 0 && (
              <ul className='space-y-2 text-[0.95rem] text-ink-2'>
                {highlights.map(text => (
                  <li key={text} className='flex items-start gap-2.5'>
                    <span className='mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success'>
                      <svg className='icon size-3' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            )}

            {canBuyHere && (
              <ProductPurchase
                productId={product.databaseId}
                name={product.name}
                stockStatus={product.stockStatus}
                stockQuantity={product.stockQuantity}
                manageStock={product.manageStock}
                attributes={isVariable ? attributes : []}
                variations={variations}
                defaultSelection={defaultSelection}
              />
            )}

            <Link
              href={product.uri}
              className='inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-link hover:underline'
            >
              বিস্তারিত দেখুন
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </Link>
          </div>
        </div>
      </ProductSelection>
    </section>
  )
}
