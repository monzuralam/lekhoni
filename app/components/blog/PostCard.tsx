import Image from 'next/image'
import Link from 'next/link'
import type { CardPost, Image as WpImage } from './data'
import { formatDate, isoDay, linkTo, minutesLabel } from './format'

// COMPONENT: PostCard (design/blog.html list variant, design/single.html grid variant).
// The author name links to their archive (/author/<slug>).
// `linkTerms` is false when no posts page is set (then category archives don't exist).

type PostCardProps = {
  post: CardPost
  variant?: 'list' | 'grid'
  linkTerms?: boolean
  priority?: boolean
}

export function PostImage ({ image, sizes, priority }: { image: WpImage; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={image.sourceUrl}
      alt=''
      width={image.mediaDetails?.width || 1200}
      height={image.mediaDetails?.height || 675}
      sizes={sizes}
      priority={priority}
      unoptimized={/\.svg(\?|$)/i.test(image.sourceUrl)}
      className='size-full object-cover transition duration-500 group-hover/post:scale-105'
    />
  )
}

// Shown when a post has no featured image, so the card keeps its shape
function Placeholder () {
  return (
    <span className='grid size-full place-items-center text-muted'>
      <svg className='icon size-8' aria-hidden='true'>
        <use href='#i-book' />
      </svg>
    </span>
  )
}

export function TermLabel ({ term, linkTerms }: { term: { name: string; uri: string }; linkTerms: boolean }) {
  const className = 'text-xs font-semibold uppercase tracking-widest text-link w-fit'
  return linkTerms ? (
    <Link href={linkTo(term.uri)} className={`${className} hover:underline`}>
      {term.name}
    </Link>
  ) : (
    <span className={className}>{term.name}</span>
  )
}

function Meta ({ post }: { post: CardPost }) {
  return (
    <p className='mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2 text-sm text-muted'>
      {post.author && (
        <>
          {post.author.avatar && (
            // Gravatar URL (not in next.config images); a 28px avatar needs no optimisation
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatar} alt='' width={28} height={28} loading='lazy' className='size-7 rounded-full' />
          )}
          {post.author.uri ? (
            <Link href={linkTo(post.author.uri)} className='font-medium text-ink-2 transition hover:text-link'>
              {post.author.name}
            </Link>
          ) : (
            <span className='font-medium text-ink-2'>{post.author.name}</span>
          )}
          <span aria-hidden='true'>·</span>
        </>
      )}
      <time dateTime={isoDay(post.dateGmt)}>{formatDate(post.dateGmt)}</time>
      <span aria-hidden='true'>·</span>
      <span>{minutesLabel(post.minutes)}</span>
    </p>
  )
}

export default function PostCard ({ post, variant = 'list', linkTerms = true, priority }: PostCardProps) {
  const category = post.categories[0]

  if (variant === 'grid') {
    return (
      <article className='group/post flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift'>
        <Link href={linkTo(post.uri)} tabIndex={-1} aria-hidden='true' className='block aspect-video overflow-hidden bg-surface-2'>
          {post.image ? <PostImage image={post.image} sizes='(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw' /> : <Placeholder />}
        </Link>
        <div className='flex flex-1 flex-col gap-2.5 p-5'>
          {category && <TermLabel term={category} linkTerms={linkTerms} />}
          <h3 className='text-xl text-ink'>
            <Link href={linkTo(post.uri)} className='transition hover:text-link'>
              {post.title}
            </Link>
          </h3>
          {post.excerpt && <p className='line-clamp-2 text-[0.95rem] leading-relaxed text-ink-2'>{post.excerpt}</p>}
          <Meta post={post} />
        </div>
      </article>
    )
  }

  return (
    <article className='group/post grid overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-300 hover:shadow-lift sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>
      <Link
        href={linkTo(post.uri)}
        tabIndex={-1}
        aria-hidden='true'
        className='block aspect-video overflow-hidden bg-surface-2 sm:aspect-auto sm:min-h-52'
      >
        {post.image ? <PostImage image={post.image} sizes='(min-width: 640px) 320px, 100vw' priority={priority} /> : <Placeholder />}
      </Link>
      <div className='flex flex-col gap-2.5 p-5 sm:p-6'>
        {category && <TermLabel term={category} linkTerms={linkTerms} />}
        <h2 className='text-xl text-ink sm:text-2xl'>
          <Link href={linkTo(post.uri)} className='transition hover:text-link'>
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className='line-clamp-3 text-[0.95rem] leading-relaxed text-ink-2'>{post.excerpt}</p>}
        <Meta post={post} />
      </div>
    </article>
  )
}
