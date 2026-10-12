import type { ProductCardData } from '@/lib/products'
import Carousel from '../Carousel'
import ProductCard from '../ProductCard'

// "এগুলোও দেখতে পারেন" carousel. The page passes WooGraphQL `related`, or
// same-category products when that list is empty.

export default function RelatedProducts ({ products }: { products: ProductCardData[] }) {
  if (!products.length) return null

  return (
    <Carousel aria-label='সম্পর্কিত পণ্য' className='mt-16 border-y border-line bg-surface-2/60 py-12'>
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <h2 className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>এগুলোও দেখতে পারেন</h2>
          <div className='flex shrink-0 items-center gap-2'>
            <button
              type='button'
              data-carousel-prev
              aria-label='আগের স্লাইড'
              className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-arrow-left' />
              </svg>
            </button>
            <button
              type='button'
              data-carousel-next
              aria-label='পরের স্লাইড'
              className='grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
            >
              <svg className='icon size-4.5' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </button>
          </div>
        </div>
        <ul
          data-carousel-track
          tabIndex={0}
          className='scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:scroll-px-6 sm:px-6'
        >
          {products.map(product => (
            <li key={product.databaseId} className='w-[72%] shrink-0 snap-start sm:w-64'>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </Carousel>
  )
}
