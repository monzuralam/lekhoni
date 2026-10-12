import Sidebar from '../blog/Sidebar'
import { getBlogSettings, getPostsByIds } from '../blog/data'
import SubscribeBand from '../home/SubscribeBand'
import FeaturedPost from './FeaturedPost'
import RecentPosts from './RecentPosts'
import ShopStrip from './ShopStrip'
import { getHomePostIds } from './data'

// Blog home (design/index.html): the homepage when Settings > Reading shows
// "Your latest posts" (see lib/front-page.ts). The intro uses the Site Title
// and Tagline from Settings > General, with the design's text as a fallback.

export default async function BlogHome () {
  const [settings, { featured, rest }] = await Promise.all([getBlogSettings(), getHomePostIds()])
  const [featuredPost, recent] = await Promise.all([
    featured ? getPostsByIds([featured]).then(posts => posts[0] ?? null) : null,
    getPostsByIds(rest.slice(0, settings.perPage))
  ])
  // Category and tag archives sit under the blog, which is "/" here
  const linkTerms = Boolean(settings.postsPage)

  return (
    <>
      <section className='mx-auto w-full max-w-site px-4 sm:px-6 pt-10 text-center sm:pt-14'>
        {settings.siteDescription ? (
          <>
            {settings.siteTitle && (
              <p className='text-xs font-semibold uppercase tracking-widest text-link'>{settings.siteTitle}</p>
            )}
            <h1 className='mx-auto mt-3 max-w-3xl text-3xl text-ink sm:text-5xl sm:leading-[1.3]'>
              {settings.siteDescription}
            </h1>
          </>
        ) : (
          <>
            <p className='text-xs font-semibold uppercase tracking-widest text-link'>বাংলায় আধুনিক ওয়েব</p>
            <h1 className='mx-auto mt-3 max-w-3xl text-3xl text-ink sm:text-5xl sm:leading-[1.3]'>
              হেডলেস ওয়ার্ডপ্রেস ও Next.js শিখুন, <span className='text-link'>সহজ বাংলায়</span>
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-lg text-ink-2'>
              টিউটোরিয়াল, গাইড আর হাতে-কলমে উদাহরণ। সঙ্গে লেখালেখির প্রিয় জিনিসপত্রের ছোট্ট দোকান।
            </p>
          </>
        )}
      </section>

      {featuredPost && <FeaturedPost post={featuredPost} linkTerms={linkTerms} />}

      <div className='mx-auto w-full max-w-site px-4 sm:px-6 mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <section aria-labelledby='recent-title'>
          <h2 id='recent-title' className='mb-6 flex items-center gap-3 text-2xl text-ink sm:text-[1.75rem]'>
            সাম্প্রতিক লেখা
          </h2>
          <RecentPosts
            // Re-mount (drop loaded batches) when the server list changes
            key={rest.slice(0, settings.perPage).join()}
            initialPosts={recent}
            initialHasMore={rest.length > settings.perPage}
            linkTerms={linkTerms}
            emptyText={featuredPost ? 'নতুন লেখা শিগগিরই আসছে।' : 'এখনো কোনো লেখা প্রকাশিত হয়নি।'}
          />
        </section>
        <Sidebar siteTitle={settings.siteTitle} siteDescription={settings.siteDescription} linkTerms={linkTerms} />
      </div>

      <ShopStrip />
      <SubscribeBand id='subscribe-email' source='blog' />
    </>
  )
}
