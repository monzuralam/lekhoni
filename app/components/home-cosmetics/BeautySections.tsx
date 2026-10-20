import Link from 'next/link'
import { bn } from '@/lib/bn'
import Carousel from '../Carousel'
import Countdown from '../Countdown'
import PostCard from '../blog/PostCard'
import { getBlogSettings, getPostIds, getPostsByIds } from '../blog/data'
import { linkTo } from '../blog/format'
import SubscribeBand from '../home/SubscribeBand'
import { TONES, spokenDate } from '../home-kit/acf'
import { CarouselNav, HomePicture, Icon, SectionHead, SmartLink, Stars } from '../home-kit/ui'
import BeautyCard from './BeautyCard'
import ConcernFilter from './ConcernFilter'
import RoutineBuilder from './RoutineBuilder'
import {
  getBeautyBestsellers,
  getBeautyBlogSettings,
  getBeautyClub,
  getBeautyReviews,
  getCategoryCircles,
  getConcerns,
  getGallery,
  getIngredients,
  getOffer,
  getPromises,
  getRoutines
} from './data'

// Sections of the "Home – Cosmetics" template (design/home-cosmetics.html),
// in page order. Each renders nothing when switched off or empty.

const WRAP = 'mx-auto w-full max-w-site px-4 sm:px-6'

// Centred eyebrow + serif title used by most sections
function Heading ({ id, eyebrow, title, align = 'center' }: { id: string; eyebrow: string; title: string; align?: 'center' | 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className='text-sm font-semibold tracking-wide text-link'>{eyebrow}</p>
      <h2 id={id} className='mt-2 text-3xl text-ink sm:text-4xl'>{title}</h2>
    </div>
  )
}

export async function PromiseStrip () {
  const items = await getPromises()
  if (!items) return null
  return (
    <section aria-labelledby='cs-promise-title' className='border-b border-line bg-surface'>
      <h2 id='cs-promise-title' className='sr-only'>আমাদের প্রতিশ্রুতি</h2>
      <ul className={`${WRAP} grid grid-cols-2 gap-x-4 gap-y-3 py-5 text-sm text-ink-2 lg:grid-cols-4`}>
        {items.map(item => (
          <li key={item.text} className='flex items-center justify-center gap-2.5'>
            <Icon name={item.icon} className='size-5 text-link' />
            <span className='font-medium'>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function CategoryCircles () {
  const section = await getCategoryCircles()
  if (!section) return null
  return (
    <section aria-labelledby='cs-cat-title' className={`${WRAP} mt-16`}>
      <Heading id='cs-cat-title' eyebrow={section.eyebrow} title={section.title} />
      <ul className='scrollbar-none -mx-4 mt-8 flex snap-x gap-6 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0'>
        {section.categories.map(category => (
          <li key={category.id} className='w-28 shrink-0 snap-start sm:w-32 lg:w-auto'>
            <Link href={category.href} className='group/cat block text-center'>
              <span className='block overflow-hidden rounded-full border-4 border-surface bg-surface-2 shadow-soft ring-1 ring-line transition duration-300 group-hover/cat:ring-2 group-hover/cat:ring-accent'>
                {category.image ? (
                  <HomePicture image={category.image} alt='' sizes='160px' className='aspect-square w-full object-cover transition duration-500 group-hover/cat:scale-110' />
                ) : (
                  <span className='grid aspect-square w-full place-items-center text-link'>
                    <Icon name={category.icon || 'sparkles'} className='size-8' />
                  </span>
                )}
              </span>
              <span className='mt-3 block font-serif text-lg text-ink transition group-hover/cat:text-link'>{category.name}</span>
              {category.count > 0 && <span className='block text-xs text-muted'>{bn(category.count)}টি পণ্য</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function ShopByConcern () {
  const section = await getConcerns()
  if (!section) return null
  return (
    <section aria-labelledby='cs-concern-title' className='mt-16 bg-surface py-14'>
      <div className={WRAP}>
        <Heading id='cs-concern-title' eyebrow={section.eyebrow} title={section.title} />
        <ConcernFilter
          allLabel={section.allLabel}
          concerns={section.concerns.map(concern => ({ key: concern.key, label: concern.label }))}
          items={section.products.map(product => ({
            id: product.databaseId,
            tags: product.tagIds.map(String),
            card: <BeautyCard product={product} />
          }))}
        />
      </div>
    </section>
  )
}

export async function BeautyBestsellers () {
  const section = await getBeautyBestsellers()
  if (!section) return null
  return (
    <Carousel aria-labelledby='cs-best-title' className={`${WRAP} mt-16`}>
      <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
        <Heading id='cs-best-title' eyebrow={section.eyebrow} title={section.title} align='left' />
        <CarouselNav />
      </div>
      <ul data-carousel-track tabIndex={0} className='scrollbar-none -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6 scroll-px-4 sm:scroll-px-6'>
        {section.products.map(product => (
          <li key={product.databaseId} className='w-[70%] shrink-0 snap-start sm:w-64'>
            <BeautyCard product={product} />
          </li>
        ))}
      </ul>
    </Carousel>
  )
}

export async function Routines () {
  const section = await getRoutines()
  if (!section) return null
  return (
    <section aria-labelledby='cs-routine-title' className={`${WRAP} mt-16`}>
      <div className='overflow-hidden rounded-card bg-surface-2 px-5 py-10 sm:px-10'>
        <Heading id='cs-routine-title' eyebrow={section.eyebrow} title={section.title} align='left' />
        {(section.text || section.discount > 0) && (
          <p className='mt-2 max-w-xl text-ink-2'>
            {section.text || `সঠিক ক্রমে ব্যবহার করলে পণ্য কাজ করে সবচেয়ে ভালো। পুরো রুটিন একসঙ্গে কিনলে ${bn(section.discount)}% ছাড়।`}
          </p>
        )}
        <RoutineBuilder routines={section.routines} />
      </div>
    </section>
  )
}

export async function Ingredients () {
  const section = await getIngredients()
  if (!section) return null
  return (
    <section aria-labelledby='cs-ingredient-title' className={`${WRAP} mt-16`}>
      <Heading id='cs-ingredient-title' eyebrow={section.eyebrow} title={section.title} />
      <div className='mt-8 grid gap-5 md:grid-cols-3'>
        {section.ingredients.map(item => (
          <article key={item.name} className='flex flex-col rounded-card border border-line bg-surface p-6 shadow-soft'>
            <span className={`grid size-14 place-items-center rounded-full ${TONES[item.tone].bg} ${TONES[item.tone].text}`}>
              <Icon name={item.icon} className='size-6' />
            </span>
            <h3 className='mt-4 font-serif text-2xl text-ink'>{item.name}</h3>
            <p className='mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-2'>{item.text}</p>
            {item.goodFor.length > 0 && (
              <p className='mt-4 flex flex-wrap gap-2'>
                <span className='sr-only'>কাদের জন্য:</span>
                {item.goodFor.map(good => (
                  <span key={good} className='rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2'>{good}</span>
                ))}
              </p>
            )}
            {item.link && (
              <SmartLink link={item.link} className='mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline'>
                {item.link.label}
                <Icon name='arrow-right' />
              </SmartLink>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export async function OfferBanner () {
  const offer = await getOffer()
  if (!offer) return null
  // After the end time the countdown says the offer has ended
  return (
    <section aria-labelledby='cs-offer-title' className={`${WRAP} mt-16`}>
      <div className={`grid items-center gap-8 overflow-hidden rounded-card bg-accent px-6 py-10 text-accent-ink sm:px-12 ${offer.image ? 'md:grid-cols-[1.2fr_1fr]' : ''}`}>
        <div className='text-center md:text-left'>
          {offer.eyebrow && (
            <p className='inline-flex items-center gap-2 text-sm font-semibold opacity-90'>
              <Icon name='gift' />
              {offer.eyebrow}
            </p>
          )}
          <h2 id='cs-offer-title' className='mt-3 text-3xl leading-snug text-accent-ink sm:text-4xl'>{offer.title}</h2>
          {offer.text && <p className='mt-3 opacity-85'>{offer.text}</p>}
          {offer.endsAt && (
            <div className='mt-6 flex justify-center md:justify-start'>
              <Countdown endsAt={offer.endsAt} label={spokenDate(offer.endsAt, offer.timezone)} inverse text='অফার শেষ হতে' />
            </div>
          )}
          {offer.link && (
            <SmartLink link={offer.link} className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-surface px-7 py-3 text-base font-semibold text-ink transition hover:brightness-95 active:scale-95'>
              {offer.link.label}
              <Icon name='arrow-right' />
            </SmartLink>
          )}
        </div>
        {offer.image && (
          <HomePicture image={offer.image} sizes='320px' className='mx-auto aspect-square w-full max-w-xs rounded-full object-cover shadow-lift' />
        )}
      </div>
    </section>
  )
}

export async function BeautyReviews () {
  const section = await getBeautyReviews()
  if (!section) return null
  return (
    <Carousel autoplay={7000} loop aria-labelledby='cs-review-title' className={`group/reviews ${WRAP} mt-16`}>
      <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <Heading id='cs-review-title' eyebrow={section.eyebrow} title={section.title} align='left' />
          {section.summary && (
            <p className='mt-2 flex flex-wrap items-center gap-2 text-ink-2'>
              <Stars rating={section.summary.average} className='size-5' />
              <strong className='text-ink'>{section.summary.average.toLocaleString('bn-BD', { maximumFractionDigits: 1 })} / ৫</strong>
              · {bn(section.summary.count)}টি রিভিউ
            </p>
          )}
        </div>
        <CarouselNav />
      </div>
      <ul data-carousel-track tabIndex={0} className='scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2'>
        {section.items.map(review => (
          <li key={review.id} className='w-full shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)]'>
            <figure className='flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-6 shadow-soft'>
              <div className='flex items-center justify-between gap-3'>
                <Stars rating={review.rating} />
                {review.verified && (
                  <span className='inline-flex items-center gap-1 text-xs font-semibold text-success'>
                    <Icon name='shield-check' className='size-3.5' />
                    যাচাইকৃত ক্রেতা
                  </span>
                )}
              </div>
              <blockquote className='flex-1 text-[0.95rem] leading-relaxed text-ink-2'>{review.text}</blockquote>
              <figcaption className='flex items-center gap-3 border-t border-line pt-4'>
                <span aria-hidden='true' className='grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 font-semibold text-link'>
                  {Array.from(review.name)[0]}
                </span>
                <span className='min-w-0 text-sm'>
                  <span className='block font-semibold text-ink'>{review.name}</span>
                  {(review.skinType || review.product) && (
                    <span className='block text-muted'>
                      {review.skinType && <>ত্বক: {review.skinType}</>}
                      {review.skinType && review.product && ' · '}
                      {review.product && (
                        <Link href={review.product.uri} className='text-link hover:underline'>{review.product.name}</Link>
                      )}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Carousel>
  )
}

export async function CustomerGallery () {
  const section = await getGallery()
  if (!section) return null
  const external = section.link ? /^https?:\/\//.test(section.link) : false
  return (
    <section aria-labelledby='cs-gallery-title' className={`${WRAP} mt-16`}>
      <Heading id='cs-gallery-title' eyebrow={section.eyebrow} title={section.title} />
      {section.text && <p className='mt-2 text-center text-ink-2'>{section.text}</p>}
      <ul className='mt-8 grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6'>
        {section.images.map((image, index) => {
          const picture = (
            <HomePicture image={image} sizes='(min-width: 1024px) 180px, 33vw' className='aspect-square w-full object-cover transition duration-500 group-hover/photo:scale-110' />
          )
          return (
            <li key={`${image.src}-${index}`}>
              {section.link ? (
                <a
                  href={section.link}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className='group/photo relative block overflow-hidden rounded-card'
                >
                  {picture}
                  <span className='absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition group-hover/photo:opacity-100'>
                    <Icon name='instagram' className='size-7' />
                    <span className='sr-only'>আরও ছবি দেখুন</span>
                  </span>
                </a>
              ) : (
                <div className='group/photo relative overflow-hidden rounded-card'>{picture}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export async function BeautyJournal () {
  const [section, settings] = await Promise.all([getBeautyBlogSettings(), getBlogSettings()])
  if (!section) return null
  const postIds = await getPostIds({ categoryId: section.category?.databaseId })
  const posts = await getPostsByIds(postIds.slice(0, section.count))
  if (!posts.length) return null
  const allHref = settings.postsPage ? linkTo(section.category?.uri || settings.postsPage.uri) : null
  return (
    <section aria-labelledby='cs-journal-title' className={`${WRAP} mt-16`}>
      <SectionHead
        id='cs-journal-title'
        title={section.title}
        icon='book'
        link={allHref ? { href: allHref, label: section.linkLabel, external: false } : null}
      />
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {posts.map(post => (
          <PostCard key={post.databaseId} post={post} variant='grid' linkTerms={Boolean(settings.postsPage)} />
        ))}
      </div>
    </section>
  )
}

export async function BeautyClub () {
  const club = await getBeautyClub()
  if (!club) return null
  return (
    <SubscribeBand
      id='beauty-club'
      source='home'
      icon='sparkles'
      title={club.title}
      text={club.text}
      successMessage={club.successMessage}
      note={club.note}
    />
  )
}
