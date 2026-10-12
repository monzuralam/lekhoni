import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import {
  discountPercent,
  formatPrice,
  stockProgress,
  type ProductCardData
} from '@/lib/products'
import AddToCartButton from './cart/AddToCartButton'
import QuickView from './QuickView'
import WishlistButton from './wishlist/WishlistButton'

type ProductCardProps = {
  product: ProductCardData
  // Flash sale cards show the sold/remaining stock bar
  showStock?: boolean
}

export default function ProductCard ({ product, showStock = false }: ProductCardProps) {
  const category = product.productCategories?.nodes?.[0]
  const hoverImage = product.galleryImages?.nodes?.[0]?.sourceUrl
  const outOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const discount = product.onSale ? discountPercent(product) : null
  const stock = showStock ? stockProgress(product) : null
  const rating = product.averageRating ?? 0
  const reviews = product.reviewCount ?? 0
  // Only simple products can go straight to the cart; the rest need options
  const canAddToCart = product.__typename === 'SimpleProduct'

  return (
    <article className='group/card relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift group-data-[view=list]/plist:flex-row'>
      <div className='relative aspect-square shrink-0 overflow-hidden bg-surface-2 group-data-[view=list]/plist:w-36 sm:group-data-[view=list]/plist:w-52'>
        <Link href={product.uri} tabIndex={-1} aria-hidden='true' className='block size-full'>
          {product.image?.sourceUrl && (
            <Image
              src={product.image.sourceUrl}
              alt=''
              width={800}
              height={800}
              sizes='(min-width: 640px) 256px, 72vw'
              className='size-full object-cover'
            />
          )}
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=''
              width={800}
              height={800}
              sizes='(min-width: 640px) 256px, 72vw'
              className='absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100'
            />
          )}
        </Link>
        {(outOfStock || discount) && (
          <div className='absolute left-3 top-3 flex flex-col items-start gap-1.5'>
            {outOfStock ? (
              <span className='rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-page'>
                স্টক শেষ
              </span>
            ) : (
              <span className='rounded-full bg-sale px-2.5 py-0.5 text-xs font-semibold text-white'>
                −{bn(discount!)}%
              </span>
            )}
          </div>
        )}
        <WishlistButton
          item={{
            id: product.databaseId,
            name: product.name,
            price: product.rawPrice ?? '',
            image: product.image?.sourceUrl ?? '',
            url: product.uri
          }}
          className='group/wish absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-soft transition hover:text-sale aria-pressed:text-sale'
        />
        <QuickView product={product} />
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-1.5 p-4'>
        {category && <p className='text-xs font-medium text-muted'>{category.name}</p>}
        <h3 className='line-clamp-2 font-serif text-base font-semibold leading-snug text-ink'>
          <Link href={product.uri} className='transition hover:text-link'>
            {product.name}
          </Link>
        </h3>
        {reviews > 0 && (
          <div className='flex items-center gap-1.5'>
            <span className='flex' role='img' aria-label={`৫-এর মধ্যে ${bn(rating.toFixed(1))} রেটিং`}>
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`icon size-4 ${star <= Math.round(rating) ? 'fill-current text-star' : 'text-line'}`}
                  aria-hidden='true'
                >
                  <use href='#i-star' />
                </svg>
              ))}
            </span>
            <span className='text-xs text-muted'>({bn(reviews)})</span>
          </div>
        )}

        <div className='mt-auto pt-1'>
          {discount ? (
            <p className='flex flex-wrap items-baseline gap-x-2'>
              <span className='sr-only'>ছাড়ের দাম</span>
              <span className='text-lg font-bold text-sale'>{formatPrice(product.price)}</span>
              <span className='sr-only'>আগের দাম</span>
              <del className='text-sm text-muted'>{formatPrice(product.regularPrice)}</del>
            </p>
          ) : (
            <p className='text-lg font-bold text-ink'>{formatPrice(product.price)}</p>
          )}

          {stock && (
            <div className='mt-1'>
              <p className='flex items-center justify-between text-xs text-ink-2'>
                <span>{bn(stock.percent)}% বিক্রি হয়ে গেছে</span>
                <span className='font-semibold text-sale'>বাকি {bn(stock.left)}টি</span>
              </p>
              <div
                role='progressbar'
                aria-label='বিক্রির অগ্রগতি'
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={stock.percent}
                className='mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2'
              >
                <div className='h-full rounded-full bg-sale' style={{ width: `${stock.percent}%` }} />
              </div>
            </div>
          )}

          {outOfStock ? (
            <button
              type='button'
              disabled
              className='mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold text-muted'
            >
              স্টক শেষ
            </button>
          ) : canAddToCart ? (
            <AddToCartButton
              productId={product.databaseId}
              name={product.name}
              className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-transparent px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent hover:text-accent-ink active:scale-95 disabled:cursor-wait disabled:opacity-70'
            />
          ) : (
            <Link
              href={product.uri}
              className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-transparent px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent hover:text-accent-ink active:scale-95'
            >
              অপশন বেছে নিন
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
