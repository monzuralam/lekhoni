import { bn } from '@/lib/bn'
import { plainText } from '@/lib/products'
import type { ReviewEdge } from './data'
import ReviewForm from './ReviewForm'

// Reviews tab: average + star breakdown, the review list and the form

export function Stars ({ rating, size = 'size-5' }: { rating: number; size?: string }) {
  return (
    <span className='flex' role='img' aria-label={`৫-এর মধ্যে ${bn(Number(rating.toFixed(1)))} রেটিং`}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`icon ${size} ${star <= Math.round(rating) ? 'fill-current text-star' : 'text-line'}`}
          aria-hidden='true'
        >
          <use href='#i-star' />
        </svg>
      ))}
    </span>
  )
}

function formatDate (iso: string) {
  try {
    return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long' }).format(new Date(iso))
  } catch {
    return bn(iso.slice(0, 10))
  }
}

type ProductReviewsProps = {
  productId: number
  averageRating: number
  reviewCount: number
  reviews: ReviewEdge[]
  reviewsAllowed: boolean
}

export default function ProductReviews ({
  productId,
  averageRating,
  reviewCount,
  reviews,
  reviewsAllowed
}: ProductReviewsProps) {
  // Breakdown from the reviews we fetched (the latest 20)
  const rated = reviews.filter(edge => edge.rating)
  const breakdown = [5, 4, 3, 2, 1].map(star => {
    const count = rated.filter(edge => Math.round(edge.rating!) === star).length
    return { star, percent: rated.length ? Math.round((count / rated.length) * 100) : 0 }
  })

  return (
    <div className='grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]'>
      <div className='self-start rounded-card border border-line bg-surface p-6 text-center shadow-soft'>
        <p className='font-serif text-5xl font-bold text-ink'>{bn(averageRating.toFixed(1))}</p>
        <div className='mt-2 flex justify-center'>
          <Stars rating={averageRating} />
        </div>
        <p className='mt-1 text-sm text-muted'>
          {reviewCount ? `${bn(reviewCount)}টি রিভিউয়ের গড়` : 'এখনো কোনো রিভিউ নেই'}
        </p>
        {rated.length > 0 && (
          <ul className='mt-5 space-y-2 text-left'>
            {breakdown.map(({ star, percent }) => (
              <li key={star} className='flex items-center gap-3 text-sm'>
                <span className='w-12 shrink-0 text-ink-2'>{bn(star)} তারা</span>
                <span
                  role='img'
                  aria-label={`${bn(percent)} শতাংশ`}
                  className='h-2 flex-1 overflow-hidden rounded-full bg-surface-2'
                >
                  <span className='block h-full rounded-full bg-star' style={{ width: `${percent}%` }} />
                </span>
                <span className='w-9 shrink-0 text-right text-muted'>{bn(percent)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className='text-xl text-ink'>ক্রেতাদের রিভিউ</h3>
        {reviews.length ? (
          <ul className='mt-2 divide-y divide-line'>
            {reviews.map(edge => (
              <li key={edge.node.id} className='py-5'>
                <article>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    {edge.rating ? <Stars rating={edge.rating} size='size-4' /> : <span />}
                    {edge.node.date && (
                      <time dateTime={edge.node.date.slice(0, 10)} className='text-sm text-muted'>
                        {formatDate(edge.node.date)}
                      </time>
                    )}
                  </div>
                  <p className='mt-2 text-[0.95rem] leading-relaxed text-ink-2'>
                    {plainText(edge.node.content)}
                  </p>
                  <p className='mt-2 flex items-center gap-2 text-sm text-muted'>
                    <strong className='font-semibold text-ink-2'>
                      {edge.node.author?.node?.name || 'অতিথি'}
                    </strong>
                  </p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-[0.95rem] text-ink-2'>
            এই পণ্যের এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই লিখুন।
          </p>
        )}

        {reviewsAllowed ? (
          <ReviewForm productId={productId} />
        ) : (
          <p className='mt-6 text-sm text-muted'>এই পণ্যে রিভিউ বন্ধ রাখা হয়েছে।</p>
        )}
      </div>
    </div>
  )
}
