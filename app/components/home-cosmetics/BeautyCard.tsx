import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import { discountPercent, formatPrice } from '@/lib/products'
import AddToCartButton from '../cart/AddToCartButton'
import WishlistButton from '../wishlist/WishlistButton'
import { Stars } from '../home-kit/ui'
import type { BeautyProduct } from './data'

// COMPONENT: BeautyCard (design/home-cosmetics.html): portrait image, centred
// serif name, colour swatches for variable products (attribute terms with a
// Swatch Colour), and a "add to bag" button over the image. Variable products
// link to the product page to pick a shade.

const MAX_SWATCHES = 5

export default function BeautyCard ({ product }: { product: BeautyProduct }) {
  const discount = product.onSale ? discountPercent(product) : null
  const outOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const category = product.productCategories?.nodes?.[0]
  const rating = product.averageRating ?? 0
  const reviews = product.reviewCount ?? 0
  const button =
    'absolute inset-x-3 bottom-3 inline-flex translate-y-2 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink opacity-0 shadow-soft transition duration-300 hover:brightness-110 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 disabled:cursor-wait'

  return (
    <article className='group/card relative flex h-full flex-col'>
      <div className='relative aspect-[4/5] shrink-0 overflow-hidden rounded-card bg-surface-2'>
        <Link href={product.uri} tabIndex={-1} aria-hidden='true' className='block size-full'>
          {product.image?.sourceUrl && (
            <Image
              src={product.image.sourceUrl}
              alt=''
              width={800}
              height={1000}
              sizes='(min-width: 1024px) 280px, (min-width: 640px) 256px, 70vw'
              className='size-full object-cover transition duration-700 group-hover/card:scale-105'
            />
          )}
        </Link>
        {outOfStock ? (
          <span className='absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-page'>স্টক শেষ</span>
        ) : discount ? (
          <span className='absolute left-3 top-3 rounded-full bg-sale px-3 py-1 text-xs font-semibold text-white'>−{bn(discount)}%</span>
        ) : null}
        <WishlistButton
          item={{ id: product.databaseId, name: product.name, price: product.rawPrice ?? '', image: product.image?.sourceUrl ?? '', url: product.uri }}
          className='group/wish absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-surface/90 text-ink-2 shadow-soft transition hover:text-sale aria-pressed:text-sale'
        />
        {!outOfStock && (product.__typename === 'SimpleProduct' ? (
          <AddToCartButton productId={product.databaseId} name={product.name} label='ব্যাগে যোগ করুন' icon='bag' className={button} />
        ) : (
          <Link href={product.uri} className={button}>
            <svg className='icon size-4' aria-hidden='true'><use href='#i-bag' /></svg>
            {product.swatches.length ? 'শেড বেছে নিন' : 'অপশন বেছে নিন'}
          </Link>
        ))}
      </div>
      <div className='flex min-w-0 flex-1 flex-col items-center gap-1 px-2 pt-4 text-center'>
        {category && <p className='text-xs tracking-wide text-muted'>{category.name}</p>}
        <h3 className='font-serif text-lg leading-snug text-ink'>
          <Link href={product.uri} className='transition hover:text-link'>{product.name}</Link>
        </h3>
        {product.swatches.length > 0 && (
          <p className='mt-1 flex items-center justify-center gap-1.5'>
            <span className='sr-only'>শেড: {product.swatches.map(swatch => swatch.name).join(', ')}</span>
            {product.swatches.slice(0, MAX_SWATCHES).map(swatch => (
              <span
                key={swatch.name}
                title={swatch.name}
                aria-hidden='true'
                className='block size-4.5 rounded-full ring-1 ring-black/10 ring-offset-2 ring-offset-page'
                style={{ backgroundColor: swatch.color }}
              />
            ))}
            {product.swatches.length > MAX_SWATCHES && (
              <span aria-hidden='true' className='text-xs text-muted'>+{bn(product.swatches.length - MAX_SWATCHES)}</span>
            )}
          </p>
        )}
        {reviews > 0 && (
          <div className='flex items-center gap-1.5'>
            <Stars rating={rating} className='size-3.5' />
            <span className='text-xs text-muted'>({bn(reviews)})</span>
          </div>
        )}
        <div className='mt-auto pt-1'>
          {discount ? (
            <p className='flex flex-wrap items-baseline justify-center gap-x-2'>
              <span className='sr-only'>ছাড়ের দাম</span>
              <span className='text-base font-bold text-sale'>{formatPrice(product.price)}</span>
              <span className='sr-only'>আগের দাম</span>
              <del className='text-sm text-muted'>{formatPrice(product.regularPrice)}</del>
            </p>
          ) : (
            <p className='text-base font-bold text-ink'>{formatPrice(product.price)}</p>
          )}
        </div>
      </div>
    </article>
  )
}
