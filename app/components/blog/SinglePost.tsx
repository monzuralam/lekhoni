import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { bn } from '@/lib/bn'
import Breadcrumbs, { type Crumb } from '../layout/Breadcrumbs'
import ShareButtons from '../product/ShareButtons'
import Comments from './Comments'
import PostCard from './PostCard'
import ReaderControls from './ReaderControls'
import ReadingProgress from './ReadingProgress'
import TableOfContents from './TableOfContents'
import { TagList } from './Sidebar'
import { blogCrumbs, getAdjacentPosts, getComments, getRelatedPosts, type BlogSettings, type SinglePost as Post } from './data'
import { formatDate, isoDateTime, isoDay, linkTo } from './format'

// Author name: a link to their archive when WordPress gives a URI
function AuthorLink ({ uri, className, children }: { uri: string | null; className: string; children: ReactNode }) {
  return uri ? (
    <Link href={linkTo(uri)} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  )
}

// Port of design/single.html. The author name and box link to /author/<slug>.

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

const card = 'rounded-card border border-line bg-surface shadow-soft'

function postCrumbs (post: Post, settings: BlogSettings): Crumb[] {
  const category = post.categories[0]
  return [
    ...blogCrumbs(settings),
    ...(settings.postsPage && category ? [{ label: category.name, href: linkTo(category.uri) }] : []),
    { label: post.title }
  ]
}

function jsonLd (post: Post, crumbs: Crumb[], siteTitle: string) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    inLanguage: 'bn',
    datePublished: isoDateTime(post.dateGmt),
    dateModified: isoDateTime(post.modifiedGmt || post.dateGmt),
    image: post.image?.sourceUrl,
    mainEntityOfPage: SITE_URL + linkTo(post.uri),
    author: post.author ? { '@type': 'Person', name: post.author.name, url: post.author.uri ? linkTo(post.author.uri) : undefined } : undefined,
    publisher: { '@type': 'Organization', name: siteTitle || 'লেখনী' }
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ label: 'হোম', href: '/' }, ...crumbs].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? SITE_URL + crumb.href : undefined
    }))
  }
  // Escape "<" so WordPress text can never close the script tag
  return JSON.stringify([article, breadcrumbs]).replace(/</g, '\\u003c')
}

export default async function SinglePost ({ post, settings }: { post: Post; settings: BlogSettings }) {
  const linkTerms = Boolean(settings.postsPage)
  const [adjacent, related, comments] = await Promise.all([
    getAdjacentPosts(post.databaseId),
    getRelatedPosts(post.categories.flatMap(category => (category.databaseId ? [category.databaseId] : [])), post.databaseId),
    getComments(post.databaseId)
  ])
  const crumbs = postCrumbs(post, settings)
  const open = post.commentStatus === 'open'
  const image = post.image

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: jsonLd(post, crumbs, settings.siteTitle) }} />
      <ReadingProgress target='#article' />

      <article id='article' className='mx-auto w-full max-w-site px-4 sm:px-6'>
        <header className='mx-auto max-w-3xl pt-10 text-center sm:pt-14'>
          <div className='flex justify-center'>
            {/* The design shortens the current crumb; JSON-LD keeps the full title */}
            <Breadcrumbs items={[...crumbs.slice(0, -1), { label: 'এই লেখা' }]} />
          </div>
          {post.categories.length > 0 && (
            <p className='mt-6 flex flex-wrap justify-center gap-2'>
              {post.categories.map(category =>
                linkTerms ? (
                  <Link
                    key={category.uri}
                    href={linkTo(category.uri)}
                    className='rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-link transition hover:bg-accent hover:text-accent-ink'
                  >
                    {category.name}
                  </Link>
                ) : (
                  <span key={category.uri} className='rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-link'>
                    {category.name}
                  </span>
                )
              )}
            </p>
          )}
          <h1 className='mt-4 text-3xl text-ink sm:text-5xl sm:leading-[1.3]'>{post.title}</h1>
          {post.excerpt && <p className='mt-4 text-lg leading-relaxed text-ink-2 sm:text-xl'>{post.excerpt}</p>}
          <div className='mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted'>
            {post.author && (
              <AuthorLink uri={post.author.uri} className='flex items-center gap-2 font-semibold text-ink transition hover:text-link'>
                {post.author.avatar && (
                  // Gravatar URL (not in next.config images)
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar} alt='' width={36} height={36} className='size-9 rounded-full' />
                )}
                {post.author.name}
              </AuthorLink>
            )}
            <span className='inline-flex items-center gap-1.5'>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-calendar' />
              </svg>
              <time dateTime={isoDay(post.dateGmt)}>{formatDate(post.dateGmt)}</time>
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-clock' />
              </svg>
              {bn(post.minutes)} মিনিটে পড়া যাবে
            </span>
            <a href='#comments' className='inline-flex items-center gap-1.5 transition hover:text-link'>
              <svg className='icon size-4' aria-hidden='true'>
                <use href='#i-chat' />
              </svg>
              {comments.length ? `${bn(comments.length)}টি মন্তব্য` : 'মন্তব্য করুন'}
            </a>
          </div>
        </header>

        {image && (
          <figure className='mx-auto mt-10 max-w-5xl'>
            <Image
              src={image.sourceUrl}
              alt={image.altText || ''}
              width={image.mediaDetails?.width || 1200}
              height={image.mediaDetails?.height || 675}
              sizes='(min-width: 1024px) 1024px, 100vw'
              unoptimized={/\.svg(\?|$)/i.test(image.sourceUrl)}
              priority
              className='aspect-video w-full rounded-card border border-line object-cover shadow-soft'
            />
            {image.caption && (
              <figcaption
                className='mt-3 text-center text-sm text-muted'
                dangerouslySetInnerHTML={{ __html: image.caption.replace(/<\/?p[^>]*>/g, '') }}
              />
            )}
          </figure>
        )}

        <div className='mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-y border-line py-3'>
          <ReaderControls />
          <ShareButtons path={post.uri} title={post.title} />
        </div>

        <div className='mx-auto mt-10 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]'>
          <div className='min-w-0'>
            {post.headings.length > 0 && (
              <details className={`${card} mb-8 p-4 group-data-reading/body:hidden lg:hidden print:hidden`}>
                <summary className='font-semibold text-ink'>সূচিপত্র</summary>
                <div className='mt-3'>
                  <TableOfContents headings={post.headings} />
                </div>
              </details>
            )}

            {post.content ? (
              // Editor content from WordPress (trusted, written by site authors)
              <div className='entry-content prose' dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p className='text-ink-2'>এই লেখায় এখনো কিছু লেখা হয়নি।</p>
            )}

            {post.tags.length > 0 && (
              <ul aria-label='ট্যাগ' className='mt-10 flex flex-wrap gap-2'>
                <TagList tags={post.tags} linkTerms={linkTerms} prefix='# ' />
              </ul>
            )}

            <div className='mt-6 flex flex-wrap items-center gap-2 border-y border-line py-4 print:hidden'>
              <span className='mr-1 text-sm font-semibold text-ink'>শেয়ার করুন:</span>
              <ShareButtons path={post.uri} title={post.title} />
            </div>

            {post.author && (
              <section
                aria-label='লেখক পরিচিতি'
                className={`${card} mt-10 flex flex-col items-center gap-5 p-6 text-center group-data-reading/body:hidden sm:flex-row sm:items-start sm:text-left`}
              >
                {post.author.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatar} alt='' width={80} height={80} loading='lazy' className='size-20 shrink-0 rounded-full' />
                )}
                <div>
                  <p className='text-xs font-semibold uppercase tracking-widest text-link'>লেখক</p>
                  <h2 className='mt-1 text-xl text-ink'>
                    <AuthorLink uri={post.author.uri} className='transition hover:text-link'>
                      {post.author.name}
                    </AuthorLink>
                  </h2>
                  {post.author.description && (
                    <p className='mt-2 text-[0.95rem] leading-relaxed text-ink-2'>{post.author.description}</p>
                  )}
                  {post.author.uri && (
                    <Link
                      href={linkTo(post.author.uri)}
                      className='inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-link transition hover:bg-accent/10 -ml-4 mt-2'
                    >
                      সব লেখা দেখুন
                      <svg className='icon size-4' aria-hidden='true'>
                        <use href='#i-arrow-right' />
                      </svg>
                    </Link>
                  )}
                </div>
              </section>
            )}

            {(adjacent.previous || adjacent.next) && (
              <nav aria-label='আগের ও পরের লেখা' className='mt-8 grid gap-4 group-data-reading/body:hidden sm:grid-cols-2 print:hidden'>
                {adjacent.previous ? (
                  <Link href={linkTo(adjacent.previous.uri)} rel='prev' className={`group/nav ${card} flex flex-col gap-1 p-5 transition hover:border-accent`}>
                    <span className='inline-flex items-center gap-1.5 text-sm text-muted'>
                      <svg className='icon size-4' aria-hidden='true'>
                        <use href='#i-arrow-left' />
                      </svg>
                      আগের লেখা
                    </span>
                    <span className='font-serif text-lg font-semibold leading-snug text-ink transition group-hover/nav:text-link'>
                      {adjacent.previous.title}
                    </span>
                  </Link>
                ) : (
                  <span className='max-sm:hidden' />
                )}
                {adjacent.next && (
                  <Link
                    href={linkTo(adjacent.next.uri)}
                    rel='next'
                    className={`group/nav ${card} flex flex-col items-end gap-1 p-5 text-right transition hover:border-accent`}
                  >
                    <span className='inline-flex items-center gap-1.5 text-sm text-muted'>
                      পরের লেখা
                      <svg className='icon size-4' aria-hidden='true'>
                        <use href='#i-arrow-right' />
                      </svg>
                    </span>
                    <span className='font-serif text-lg font-semibold leading-snug text-ink transition group-hover/nav:text-link'>
                      {adjacent.next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}

            <Comments postId={post.databaseId} authorId={post.author?.databaseId ?? null} open={open} />
          </div>

          {post.headings.length > 0 && (
            <aside aria-label='সূচিপত্র' className='self-start group-data-reading/body:hidden max-lg:hidden lg:sticky lg:top-32 print:hidden'>
              <div className={`${card} p-5`}>
                <h2 className='mb-3 flex items-center gap-2 text-base text-ink'>
                  <svg className='icon size-4 text-link' aria-hidden='true'>
                    <use href='#i-list' />
                  </svg>
                  এই লেখায় যা আছে
                </h2>
                <TableOfContents headings={post.headings} />
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby='related-title' className='mt-16 bg-surface-2 py-14 group-data-reading/body:hidden print:hidden'>
          <div className='mx-auto w-full max-w-site px-4 sm:px-6'>
            <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
              <h2 id='related-title' className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
                আরো পড়ুন
              </h2>
              {settings.postsPage && (
                <Link href={linkTo(settings.postsPage.uri)} className='inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link hover:underline'>
                  সব লেখা
                  <svg className='icon size-4' aria-hidden='true'>
                    <use href='#i-arrow-right' />
                  </svg>
                </Link>
              )}
            </div>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {related.map(item => (
                <PostCard key={item.databaseId} post={item} variant='grid' linkTerms={linkTerms} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
