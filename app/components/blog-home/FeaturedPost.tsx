import Link from 'next/link'
import type { CardPost } from '../blog/data'
import { PostImage, TermLabel } from '../blog/PostCard'
import { formatDate, isoDay, linkTo, minutesLabel } from '../blog/format'

// COMPONENT: FeaturedPost (design/index.html). The newest sticky post, else
// the newest post; see getHomePostIds.

export default function FeaturedPost ({ post, linkTerms }: { post: CardPost; linkTerms: boolean }) {
  const category = post.categories[0]
  const author = post.author

  return (
    <section aria-labelledby='featured-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10'>
      <h2 id='featured-title' className='sr-only'>
        নির্বাচিত লেখা
      </h2>
      <article className='group/post grid overflow-hidden rounded-card border border-line bg-surface shadow-soft transition duration-300 hover:shadow-lift lg:grid-cols-2'>
        <Link
          href={linkTo(post.uri)}
          tabIndex={-1}
          aria-hidden='true'
          className='block aspect-video overflow-hidden bg-surface-2 lg:aspect-auto lg:min-h-96'
        >
          {post.image ? (
            <PostImage image={post.image} sizes='(min-width: 1024px) 640px, 100vw' priority />
          ) : (
            <span className='grid size-full place-items-center text-muted'>
              <svg className='icon size-10' aria-hidden='true'>
                <use href='#i-book' />
              </svg>
            </span>
          )}
        </Link>
        <div className='flex flex-col justify-center gap-4 p-6 sm:p-10'>
          <p className='flex items-center gap-3'>
            <span className='rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink'>নির্বাচিত</span>
            {category && <TermLabel term={category} linkTerms={linkTerms} />}
          </p>
          <h3 className='text-2xl text-ink sm:text-4xl sm:leading-[1.3]'>
            <Link href={linkTo(post.uri)} className='transition hover:text-link'>
              {post.title}
            </Link>
          </h3>
          {post.excerpt && <p className='text-lg leading-relaxed text-ink-2'>{post.excerpt}</p>}
          <div className='flex flex-wrap items-center justify-between gap-4 pt-2'>
            <p className='flex items-center gap-3 text-sm text-muted'>
              {author?.avatar && (
                // Gravatar URL (not in next.config images); a 40px avatar needs no optimisation
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar} alt='' width={40} height={40} loading='lazy' className='size-10 rounded-full' />
              )}
              <span>
                {author && (author.uri ? (
                  <Link href={linkTo(author.uri)} className='block font-semibold text-ink transition hover:text-link'>
                    {author.name}
                  </Link>
                ) : (
                  <span className='block font-semibold text-ink'>{author.name}</span>
                ))}
                <time dateTime={isoDay(post.dateGmt)}>{formatDate(post.dateGmt)}</time> · {minutesLabel(post.minutes)}
              </span>
            </p>
            <Link
              href={linkTo(post.uri)}
              className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-95'
            >
              পুরো লেখা পড়ুন
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    </section>
  )
}
