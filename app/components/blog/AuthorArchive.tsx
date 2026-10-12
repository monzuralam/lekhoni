import { bn } from '@/lib/bn'
import Breadcrumbs, { type Crumb } from '../layout/Breadcrumbs'
import Pagination from '../shop/Pagination'
import PostCard from './PostCard'
import { pageHref } from './BlogList'
import type { Author, CardPost } from './data'

// Port of design/author.html: AuthorHeader + the author's posts as grid
// PostCards. The design's "load more" button becomes numbered pages
// (/author/<slug>/page/N), like the blog list. Profile fields come from
// WordPress (Users > Profile, plus the ACF "Author Profile" group).

type AuthorArchiveProps = {
  author: Author
  crumbs: Crumb[]
  posts: CardPost[]
  total: number
  page: number
  totalPages: number
  linkTerms: boolean // category links only exist when a posts page is set
}

const SOCIAL_LINK =
  'grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-link'

export default function AuthorArchive ({ author, crumbs, posts, total, page, totalPages, linkTerms }: AuthorArchiveProps) {
  const social = [
    { href: author.social.facebook, icon: 'facebook', label: 'ফেসবুক' },
    { href: author.social.x, icon: 'x', label: 'এক্স' },
    { href: author.social.linkedin, icon: 'linkedin', label: 'লিংকডইন' },
    { href: author.website, icon: 'link', label: 'ব্যক্তিগত ওয়েবসাইট' }
  ].filter(link => link.href && /^https?:\/\//i.test(link.href))

  const stats = [
    { value: bn(total), label: 'লেখা' },
    ...(author.experience ? [{ value: author.experience, label: 'বছরের অভিজ্ঞতা' }] : []),
    { value: bn(author.commentTotal), label: 'পাঠকের মন্তব্য' }
  ]

  return (
    <>
      <header className='border-b border-line bg-surface-2/60'>
        <div className='mx-auto w-full max-w-site px-4 sm:px-6 py-12 text-center'>
          <div className='flex justify-center'>
            <Breadcrumbs items={crumbs} />
          </div>
          {author.avatar && (
            // Gravatar URL (not in next.config images)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatar}
              alt={`${author.name}-এর ছবি`}
              width={160}
              height={160}
              fetchPriority='high'
              className='mx-auto mt-6 size-28 rounded-full border-4 border-surface shadow-soft'
            />
          )}
          <h1 className='mt-4 text-3xl text-ink sm:text-4xl'>{author.name}</h1>
          {author.jobTitle && <p className='mt-1 font-medium text-link'>{author.jobTitle}</p>}
          {author.description && <p className='mx-auto mt-4 max-w-2xl text-ink-2'>{author.description}</p>}
          {social.length > 0 && (
            <div className='mt-5 flex justify-center gap-2'>
              {social.map(link => (
                <a
                  key={link.icon}
                  href={link.href!}
                  target='_blank'
                  rel='noopener noreferrer me'
                  aria-label={link.label}
                  className={SOCIAL_LINK}
                >
                  <svg className='icon size-4' aria-hidden='true'>
                    <use href={`#i-${link.icon}`} />
                  </svg>
                </a>
              ))}
            </div>
          )}
          <dl className='mt-8 flex justify-center divide-x divide-line'>
            {stats.map(stat => (
              <div key={stat.label} className='px-6 text-center'>
                <dd className='font-serif text-3xl font-bold text-ink'>{stat.value}</dd>
                <dt className='text-sm text-muted'>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section aria-labelledby='author-posts' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-12'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
          <h2 id='author-posts' className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
            {author.name}-এর লেখা
          </h2>
        </div>
        {posts.length ? (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post, index) => (
              <PostCard key={post.databaseId} post={post} variant='grid' linkTerms={linkTerms} priority={index === 0 && page === 1} />
            ))}
          </div>
        ) : (
          <p className='rounded-card border border-dashed border-line px-6 py-12 text-center text-ink-2'>
            এই লেখকের এখনো কোনো লেখা প্রকাশিত হয়নি।
          </p>
        )}
        {totalPages > 1 && (
          <div className='mt-10'>
            <Pagination page={page} totalPages={totalPages} href={n => pageHref(author.uri, n)} />
          </div>
        )}
      </section>
    </>
  )
}
