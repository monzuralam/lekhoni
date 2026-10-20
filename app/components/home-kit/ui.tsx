import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HomeImage, HomeLink } from './acf'

// Small building blocks shared by the e-commerce and cosmetics homes.

export function Icon ({ name, className = 'size-4' }: { name: string; className?: string }) {
  return (
    <svg className={`icon ${className}`} aria-hidden='true'>
      <use href={`#i-${name}`} />
    </svg>
  )
}

const NAV_BUTTON =
  'grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft transition hover:border-accent hover:text-link disabled:cursor-not-allowed disabled:opacity-40'

// Prev/next buttons for a <Carousel> (data-carousel-prev/next hooks)
export function CarouselNav ({ className = 'flex shrink-0 items-center gap-2' }: { className?: string }) {
  return (
    <div className={className}>
      <button type='button' data-carousel-prev aria-label='আগের স্লাইড' className={NAV_BUTTON}>
        <Icon name='arrow-left' className='size-4.5' />
      </button>
      <button type='button' data-carousel-next aria-label='পরের স্লাইড' className={NAV_BUTTON}>
        <Icon name='arrow-right' className='size-4.5' />
      </button>
    </div>
  )
}

// "Title ........ See all →" row used above most sections
export function SectionHead ({
  id,
  title,
  icon,
  link,
  children
}: {
  id: string
  title: string
  icon?: string | null
  link?: HomeLink | null
  children?: ReactNode
}) {
  return (
    <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
      <h2 id={id} className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
        {icon && (
          <span className='grid size-9 place-items-center rounded-full bg-accent/10 text-link'>
            <Icon name={icon} className='size-5' />
          </span>
        )}
        {title}
      </h2>
      {children}
      {link && <MoreLink link={link} />}
    </div>
  )
}

export function MoreLink ({ link }: { link: HomeLink }) {
  return (
    <SmartLink link={link} className='inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link hover:underline'>
      {link.label}
      <Icon name='arrow-right' />
    </SmartLink>
  )
}

// Next <Link> for storefront paths, a plain <a> (new tab) for other sites
export function SmartLink ({
  link,
  className,
  children
}: {
  link: HomeLink
  className?: string
  children: ReactNode
}) {
  return link.external ? (
    <a href={link.href} target='_blank' rel='noopener noreferrer' className={className}>
      {children}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {children}
    </Link>
  )
}

export function HomePicture ({
  image,
  className,
  sizes,
  priority = false,
  alt
}: {
  image: HomeImage
  className?: string
  sizes: string
  priority?: boolean
  alt?: string
}) {
  return (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      unoptimized={/\.svg(\?|$)/i.test(image.src)}
      className={className}
    />
  )
}

// Five stars, filled up to the rounded rating
export function Stars ({ rating, className = 'size-4' }: { rating: number; className?: string }) {
  const full = Math.round(rating)
  return (
    <span className='flex' role='img' aria-label={`৫-এর মধ্যে ${rating.toLocaleString('bn-BD', { maximumFractionDigits: 1 })} রেটিং`}>
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} className={`icon ${className} ${star <= full ? 'fill-current text-star' : 'text-line'}`} aria-hidden='true'>
          <use href='#i-star' />
        </svg>
      ))}
    </span>
  )
}
