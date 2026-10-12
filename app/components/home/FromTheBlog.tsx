import Link from 'next/link'
import PostCard from '../blog/PostCard'
import { getBlogSettings, getPostIds, getPostsByIds } from '../blog/data'
import { linkTo } from '../blog/format'
import { getHomeContent } from './content-data'

// COMPONENT: FromTheBlog (design/home-shop.html). The latest posts (default 3),
// optionally from one category, set in the "Home Content" ACF group.
// "See all" goes to that category or to the posts page (Settings → Reading);
// without a posts page there is no link. Hidden when there are no posts.

export default async function FromTheBlog () {
  const [content, settings] = await Promise.all([getHomeContent(), getBlogSettings()])
  const section = content?.blogSection
  const category = section?.category?.nodes?.[0] ?? null
  const count = Math.min(12, Math.max(1, Number(section?.count) || 3))

  const ids = await getPostIds({ categoryId: category?.databaseId })
  const posts = await getPostsByIds(ids.slice(0, count))
  if (!posts.length) return null

  // Category archives live under the posts page's routing, so they need one too
  const hasArchives = Boolean(settings.postsPage)
  const allHref = settings.postsPage ? linkTo(category?.uri || settings.postsPage.uri) : null

  return (
    <section aria-labelledby='guides-title' className='mx-auto w-full max-w-site px-4 sm:px-6 mt-14'>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3'>
        <h2 id='guides-title' className='flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
          <span className='grid size-9 place-items-center rounded-full bg-accent/10 text-link'>
            <svg className='icon size-5' aria-hidden='true'>
              <use href='#i-book' />
            </svg>
          </span>
          {section?.title || 'ব্লগ থেকে'}
        </h2>
        {allHref && (
          <Link href={allHref} className='inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link hover:underline'>
            {section?.linkLabel || 'সব লেখা'}
            <svg className='icon size-4' aria-hidden='true'>
              <use href='#i-arrow-right' />
            </svg>
          </Link>
        )}
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {posts.map(post => (
          <PostCard key={post.databaseId} post={post} variant='grid' linkTerms={hasArchives} />
        ))}
      </div>
    </section>
  )
}
