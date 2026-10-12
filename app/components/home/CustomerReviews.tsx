import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import Carousel from '../Carousel'
import { Stars } from '../product/ProductReviews'
import { getCustomerReviews } from './products-data'

// Port of the CustomerReviews section of design/home-shop.html. Shows
// approved 4–5 star WooCommerce product reviews and/or the testimonials from
// ACF "Home Products" → Customer Reviews, as chosen by its "Show" setting
// (default: product reviews, or the testimonials when there are none). The
// store-wide rating line only appears with real reviews. Hidden when empty.

const NAV_BUTTON =
  'grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'

export default async function CustomerReviews () {
  const { title, items, summary } = await getCustomerReviews()
  if (!items.length) return null

  return (
    <Carousel
      autoplay={7000}
      loop
      aria-label={title}
      className='group/reviews mt-16 bg-surface-2 py-14'
    >
      <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h2 className='text-2xl text-ink sm:text-[1.75rem]'>{title}</h2>
            {summary && (
              <p className='mt-2 flex flex-wrap items-center gap-2 text-ink-2'>
                <Stars rating={summary.average} />
                <strong className='text-ink'>{bn(summary.average.toFixed(1))} / ৫</strong> ·{' '}
                {bn(summary.count)}টি রিভিউ
              </p>
            )}
          </div>
          {items.length > 1 && (
            <div className='flex items-center gap-2'>
              <button type='button' data-carousel-toggle aria-label='স্লাইড থামান' className={NAV_BUTTON}>
                <svg className='icon size-4 group-data-paused/reviews:hidden' aria-hidden='true'>
                  <use href='#i-pause' />
                </svg>
                <svg className='icon hidden size-4 group-data-paused/reviews:block' aria-hidden='true'>
                  <use href='#i-play' />
                </svg>
              </button>
              <div className='flex shrink-0 items-center gap-2'>
                <button type='button' data-carousel-prev aria-label='আগের স্লাইড' className={NAV_BUTTON}>
                  <svg className='icon size-4.5' aria-hidden='true'>
                    <use href='#i-arrow-left' />
                  </svg>
                </button>
                <button type='button' data-carousel-next aria-label='পরের স্লাইড' className={NAV_BUTTON}>
                  <svg className='icon size-4.5' aria-hidden='true'>
                    <use href='#i-arrow-right' />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        <ul
          data-carousel-track
          tabIndex={0}
          className='scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2'
        >
          {items.map(item => (
            <li key={item.id} className='w-full shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)]'>
              <figure className='flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-soft'>
                <span className='text-link opacity-40'>
                  <svg className='icon size-8' aria-hidden='true'>
                    <use href='#i-quote' />
                  </svg>
                </span>
                <Stars rating={item.rating} size='size-4' />
                <blockquote className='flex-1 text-[0.95rem] leading-relaxed text-ink-2'>
                  {item.text}
                </blockquote>
                <figcaption className='flex items-center justify-between gap-3 border-t border-line pt-4'>
                  <span className='flex min-w-0 items-center gap-3'>
                    {item.photo && (
                      <Image
                        src={item.photo.sourceUrl}
                        alt=''
                        width={80}
                        height={80}
                        className='size-10 shrink-0 rounded-full bg-surface-2 object-cover'
                      />
                    )}
                    <span className='min-w-0'>
                      <span className='block font-semibold text-ink'>{item.name}</span>
                      {item.product ? (
                        <Link
                          href={item.product.uri}
                          className='block truncate text-sm text-muted transition hover:text-link'
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        item.meta && <span className='block text-sm text-muted'>{item.meta}</span>
                      )}
                    </span>
                  </span>
                  {item.verified && (
                    <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success'>
                      <svg className='icon size-3.5' aria-hidden='true'>
                        <use href='#i-check' />
                      </svg>
                      যাচাইকৃত ক্রেতা
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {items.length > 1 && (
          <div data-carousel-dots className='mt-6 flex items-center justify-center gap-2' />
        )}
      </div>
    </Carousel>
  )
}
