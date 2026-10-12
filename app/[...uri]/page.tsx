import type { Metadata } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { bn } from '@/lib/bn'
import { plainText } from '@/lib/products'
import type { Crumb } from '../components/layout/Breadcrumbs'
import WordPressPage, { getPage, pageMetadata, type WpPage } from '../components/layout/WordPressPage'
import BlogList, { pageHref } from '../components/blog/BlogList'
import SinglePost from '../components/blog/SinglePost'
import AuthorArchive from '../components/blog/AuthorArchive'
import { linkTo } from '../components/blog/format'
import {
  blogCrumbs,
  getAuthor,
  getBlogSettings,
  getPost,
  getPostIds,
  getPostsByIds,
  getStaticUris,
  resolveUri,
  type Author,
  type BlogSettings,
  type ListFilter
} from '../components/blog/data'

// Every WordPress URL that has no app route of its own. Posts and pages share
// one URL space (/%postname%/), so the URI is resolved with nodeByUri and
// dispatched on what WordPress says it is:
// - the "Posts page" from Settings > Reading (+ /page/N/)  -> blog list
// - a category or tag archive (+ /page/N/)                 -> filtered blog list
// - an author archive /author/<slug>/ (+ /page/N/)         -> author page
// - a post                                                 -> single post
// - a page                                                 -> page (as before)
// - anything else                                          -> 404
// With no posts page set there is no blog list and no category/tag archives;
// author archives, posts and pages still resolve. When the homepage shows the
// latest posts, the blog list is "/" (app/page.tsx), archives sit under it and
// the unused "Posts page" redirects there. Routes that exist in the app
// (/about, /shop, …) take priority over this catch-all.

// /sample-page/ -> ['sample-page']
const toSegments = (uri: string) => uri.split('/').filter(Boolean)

// First path segments that have their own app route
const APP_ROUTES = new Set([
  'about', 'api', 'cart', 'checkout', 'contact', 'forgot-password', 'login', 'my-account',
  'order-received', 'product', 'product-category', 'register', 'reset-password', 'shop'
])

export async function generateStaticParams () {
  // getStaticUris skips null URIs (the posts page itself has uri: null)
  const uris = (await getStaticUris()).filter(uri => uri && !APP_ROUTES.has(toSegments(uri)[0]))
  // cacheComponents needs at least one entry
  return uris.length ? uris.map(uri => ({ uri: toSegments(uri) })) : [{ uri: ['sample-page'] }]
}

type Archive = {
  title: string
  description: string | null
  crumbs: Crumb[]
  baseUri: string
  activeUri: string | null
  filter: ListFilter
}

type Route =
  | { kind: 'list'; settings: BlogSettings & { postsPage: NonNullable<BlogSettings['postsPage']> }; archive: Archive; page: number }
  | { kind: 'author'; settings: BlogSettings; author: Author; page: number }
  | { kind: 'post'; settings: BlogSettings; post: NonNullable<Awaited<ReturnType<typeof getPost>>> }
  | { kind: 'page'; page: WpPage }

// Compare URIs whatever their percent-encoding (Bangla slugs)
function same (a: string, b: string) {
  const norm = (uri: string) => {
    try {
      return decodeURIComponent(uri).toLowerCase()
    } catch {
      return uri.toLowerCase()
    }
  }
  return norm(a) === norm(b)
}

async function resolveRoute (params: PageProps<'/[...uri]'>['params']): Promise<Route | null> {
  const { uri } = await params
  let path: string
  try {
    path = `/${uri.map(segment => decodeURIComponent(segment)).join('/')}/`
  } catch {
    return null
  }

  // Archive pagination: <archive>/page/N/
  const paged = /^(.*\/)page\/([^/]+)\/$/.exec(path)
  const base = paged ? paged[1] : path
  const pageNumber = paged ? Number(paged[2]) : 1
  if (paged && !(Number.isInteger(pageNumber) && pageNumber >= 1 && String(pageNumber) === paged[2])) return null

  const [settings, node] = await Promise.all([getBlogSettings(), resolveUri(path).catch(() => null)])
  if (!node) return null

  if (node.type === 'PostsPage' || node.type === 'Category' || node.type === 'Tag') {
    const { postsPage } = settings
    if (!postsPage) return null
    const archiveUri = node.type === 'PostsPage' ? postsPage.uri : node.uri
    // nodeByUri also accepts junk after an archive URI; only exact matches render
    if (!same(base, archiveUri)) return null
    if (paged && pageNumber === 1) permanentRedirect(linkTo(archiveUri))
    const archive: Archive = node.type === 'PostsPage'
      ? { title: postsPage.title, description: null, crumbs: [{ label: postsPage.title }], baseUri: postsPage.uri, activeUri: postsPage.uri, filter: {} }
      : {
          title: node.name,
          description: node.description,
          crumbs: [...blogCrumbs(settings), { label: node.name }],
          baseUri: node.uri,
          activeUri: node.type === 'Category' ? node.uri : null,
          filter: node.type === 'Category' ? { categoryId: node.databaseId } : { tagId: node.databaseId }
        }
    return { kind: 'list', settings: { ...settings, postsPage }, archive, page: pageNumber }
  }

  // Author archive (+ /page/N/); works whether or not a posts page is set
  if (node.type === 'User') {
    if (!same(base, node.uri)) return null
    if (paged && pageNumber === 1) permanentRedirect(linkTo(node.uri))
    const author = await getAuthor(node.databaseId)
    return author ? { kind: 'author', settings, author, page: pageNumber } : null
  }

  // The static front page by its slug (/home from a menu link): WordPress
  // serves it at "/". Temporary redirect, since the front page can change.
  if (node.type === 'Page' && node.isFrontPage && !paged) redirect('/')

  // Posts and pages: nodeByUri ignores /page/N/ and /2/ suffixes, so require the exact URI
  if (paged || !same(path, node.uri)) return null

  if (node.type === 'Post') {
    const post = await getPost(node.uri)
    return post ? { kind: 'post', settings, post } : null
  }
  if (node.type === 'Page') {
    // The "Posts page" is unused while the homepage shows the latest posts
    if (settings.showOnFront === 'posts' && settings.postsPage?.id === node.databaseId) redirect('/')
    const page = await getPage(path)
    // The front page lives at "/", not under a slug
    return page && !page.isFrontPage ? { kind: 'page', page } : null
  }
  return null
}

// The posts of one list page, or null when the page is out of range
async function listPage (archive: Archive, page: number, perPage: number) {
  const ids = await getPostIds(archive.filter)
  const totalPages = Math.max(1, Math.ceil(ids.length / perPage))
  if (page > totalPages) return null
  const posts = await getPostsByIds(ids.slice((page - 1) * perPage, page * perPage))
  return { posts, total: ids.length, totalPages }
}

const withPage = (title: string, page: number) => (page > 1 ? `${title} — পৃষ্ঠা ${bn(page)}` : title)

export async function generateMetadata ({ params }: PageProps<'/[...uri]'>): Promise<Metadata> {
  const route = await resolveRoute(params)
  if (!route) return { title: 'পাতা পাওয়া যায়নি' }

  if (route.kind === 'list') {
    const { archive, page, settings } = route
    const title = withPage(archive.title, page)
    const description = (archive.description ? plainText(archive.description) : settings.siteDescription) || undefined
    const url = pageHref(archive.baseUri, page)
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { type: 'website', title, description, url }
    }
  }

  if (route.kind === 'author') {
    const { author, page } = route
    const title = withPage(author.name, page)
    const description = (author.description || author.jobTitle || `${author.name}-এর লেখা`).slice(0, 160)
    const url = pageHref(author.uri, page)
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { type: 'profile', title, description, url, images: author.avatar ? [author.avatar] : undefined }
    }
  }

  if (route.kind === 'post') {
    const { post } = route
    const description = (post.excerpt || plainText(post.content)).slice(0, 160) || undefined
    const image = post.image
    return {
      title: post.title,
      description,
      alternates: { canonical: linkTo(post.uri) },
      openGraph: {
        type: 'article',
        title: post.title,
        description,
        url: linkTo(post.uri),
        publishedTime: new Date(`${post.dateGmt}Z`).toISOString(),
        authors: post.author ? [post.author.name] : undefined,
        images: image ? [{ url: image.sourceUrl, alt: image.altText || post.title }] : undefined
      }
    }
  }

  return pageMetadata(route.page)
}

export default async function WordPressRoute ({ params }: PageProps<'/[...uri]'>) {
  const route = await resolveRoute(params)
  if (!route) notFound()

  if (route.kind === 'list') {
    const { archive, page, settings } = route
    const result = await listPage(archive, page, settings.perPage)
    if (!result) notFound()
    return (
      <BlogList
        settings={settings}
        title={archive.title}
        description={archive.description}
        crumbs={archive.crumbs}
        baseUri={archive.baseUri}
        activeUri={archive.activeUri}
        posts={result.posts}
        total={result.total}
        page={page}
        totalPages={result.totalPages}
      />
    )
  }

  if (route.kind === 'author') {
    const { author, page, settings } = route
    const result = await listPage({ title: author.name, description: author.description, crumbs: [], baseUri: author.uri, activeUri: null, filter: { authorId: author.databaseId } }, page, settings.perPage)
    if (!result) notFound()
    const crumbs: Crumb[] = [...blogCrumbs(settings), { label: author.name }]
    return (
      <AuthorArchive
        author={author}
        crumbs={crumbs}
        posts={result.posts}
        total={result.total}
        page={page}
        totalPages={result.totalPages}
        linkTerms={!!settings.postsPage}
      />
    )
  }

  if (route.kind === 'post') {
    return <SinglePost post={route.post} settings={route.settings} />
  }

  return <WordPressPage page={route.page} />
}
