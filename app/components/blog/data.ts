import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { rawQuery } from '@/lib/auth'
import { addHeadingIds, linkTo, readingMinutes, textFromHtml, type Heading } from './format'

// GraphQL for the blog (WPGraphQL core only, no extra plugins).
// Every function is cached; tags: 'posts', 'blog-settings', `post:<uri>`, `comments:<id>`.

export type Image = {
  sourceUrl: string
  altText: string | null
  caption?: string | null
  mediaDetails: { width: number | null; height: number | null } | null
}

export type TermLink = { databaseId?: number; name: string; uri: string }

export type CardPost = {
  databaseId: number
  title: string
  uri: string
  excerpt: string // plain text
  dateGmt: string
  minutes: number
  image: Image | null
  author: { name: string; uri: string | null; avatar: string | null } | null
  categories: TermLink[]
}

export type BlogSettings = {
  // Settings > Reading "Your homepage displays"; 'posts' puts the blog on "/"
  showOnFront: 'posts' | 'page'
  // Where the blog list lives: the "Posts page", or "/" when showOnFront is 'posts'
  postsPage: { id: number; title: string; uri: string } | null
  perPage: number
  siteTitle: string
  siteDescription: string
}

export type ResolvedNode =
  | { type: 'PostsPage'; uri: string }
  | { type: 'Category' | 'Tag'; uri: string; databaseId: number; name: string; description: string | null }
  | { type: 'User'; uri: string; databaseId: number; name: string }
  | { type: 'Post'; uri: string }
  | { type: 'Page'; uri: string; databaseId: number; isFrontPage: boolean }
  | { type: 'Other'; uri: string }

const IMAGE_FIELDS = `sourceUrl altText mediaDetails { width height }`

const CARD_FIELDS = `
  databaseId
  title
  uri
  excerpt
  content
  dateGmt
  featuredImage { node { ${IMAGE_FIELDS} } }
  author { node { name uri avatar(size: 56) { url } } }
  categories(first: 10) { nodes { databaseId name uri } }
`

type RawCard = {
  databaseId: number
  title: string
  uri: string
  excerpt: string | null
  content: string | null
  dateGmt: string
  featuredImage: { node: Image } | null
  author: { node: { name: string; uri: string | null; avatar: { url: string } | null } } | null
  categories: { nodes: TermLink[] } | null
}

// Drop the content (only needed for the reading time) so cached cards stay small
function toCard (post: RawCard): CardPost {
  return {
    databaseId: post.databaseId,
    title: post.title,
    uri: post.uri,
    excerpt: textFromHtml(post.excerpt).replace(/\s*\[…\]$/, '…'),
    dateGmt: post.dateGmt,
    minutes: readingMinutes(post.content),
    image: post.featuredImage?.node ?? null,
    author: post.author?.node
      ? { name: post.author.node.name, uri: post.author.node.uri ?? null, avatar: post.author.node.avatar?.url ?? null }
      : null,
    categories: post.categories?.nodes ?? []
  }
}

export async function getBlogSettings (): Promise<BlogSettings> {
  'use cache'
  cacheLife('minutes')
  cacheTag('blog-settings')
  const data = await wpQuery(`{
    readingSettings { pageForPosts postsPerPage }
    generalSettings { title description }
    contentType(id: "post", idType: NAME) { uri isPostsPage isFrontPage }
  }`)
  const id = Number(data?.readingSettings?.pageForPosts) || 0
  let postsPage: BlogSettings['postsPage'] = null
  if (id) {
    const page = await wpQuery(
      `query PostsPage($id: ID!) { page(id: $id, idType: DATABASE_ID) { title link status } }`,
      { id }
    )
    // The posts page's own `uri` is null in WPGraphQL; the post type archive carries it
    const uri = data?.contentType?.isPostsPage && data.contentType.uri
      ? data.contentType.uri
      : page?.page?.link ? new URL(page.page.link).pathname : null
    if (page?.page && page.page.status === 'publish' && uri) {
      postsPage = { id, title: page.page.title, uri }
    }
  }
  // With "Your latest posts" (or no static page chosen) the post archive is
  // the front page and WordPress ignores the posts page: the blog is "/"
  const showOnFront = data?.contentType?.isFrontPage ? 'posts' : 'page'
  if (showOnFront === 'posts') {
    postsPage = { id: postsPage?.id ?? 0, title: postsPage?.title || 'ব্লগ', uri: '/' }
  }
  return {
    showOnFront,
    postsPage,
    perPage: Math.max(1, Number(data?.readingSettings?.postsPerPage) || 10),
    siteTitle: data?.generalSettings?.title ?? '',
    siteDescription: data?.generalSettings?.description ?? ''
  }
}

export async function resolveUri (uri: string): Promise<ResolvedNode | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts', 'pages', `uri:${uri}`)
  const data = await wpQuery(
    `query Resolve($uri: String!) {
      nodeByUri(uri: $uri) {
        __typename
        uri
        ... on ContentType { isPostsPage }
        ... on Category { databaseId name description }
        ... on Tag { databaseId name description }
        ... on Page { databaseId isFrontPage }
        ... on User { databaseId name }
      }
    }`,
    { uri }
  )
  const node = data?.nodeByUri
  if (!node) return null
  switch (node.__typename) {
    case 'ContentType':
      return node.isPostsPage ? { type: 'PostsPage', uri: node.uri } : { type: 'Other', uri: node.uri }
    case 'Category':
    case 'Tag':
      return {
        type: node.__typename,
        uri: node.uri,
        databaseId: node.databaseId,
        name: node.name,
        description: node.description
      }
    case 'User':
      return { type: 'User', uri: node.uri, databaseId: node.databaseId, name: node.name }
    case 'Post':
      return { type: 'Post', uri: node.uri }
    case 'Page':
      return { type: 'Page', uri: node.uri, databaseId: node.databaseId, isFrontPage: node.isFrontPage }
    default:
      return { type: 'Other', uri: node.uri ?? '' }
  }
}

export type ListFilter = { categoryId?: number; tagId?: number; authorId?: number }

// WPGraphQL has no total count, so the archive's post IDs (newest first) are
// fetched in batches of 100 and cached. Their length gives the page count and
// a slice of them gives any page; see getPostsByIds.
export async function getPostIds ({ categoryId, tagId, authorId }: ListFilter = {}): Promise<number[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const ids: number[] = []
  let after: string | null = null
  for (let batch = 0; batch < 50; batch++) {
    const data = await wpQuery(
      `query PostIds($after: String, $cat: Int, $tag: String, $author: Int) {
        posts(first: 100, after: $after, where: { categoryId: $cat, tagId: $tag, author: $author }) {
          pageInfo { hasNextPage endCursor }
          nodes { databaseId }
        }
      }`,
      { after, cat: categoryId ?? null, tag: tagId ? String(tagId) : null, author: authorId ?? null }
    )
    const posts = data?.posts
    ids.push(...(posts?.nodes ?? []).map((node: { databaseId: number }) => node.databaseId))
    if (!posts?.pageInfo?.hasNextPage) break
    after = posts.pageInfo.endCursor
  }
  return ids
}

// The newest sticky post (Edit Post > "Stick to the top of the blog")
export async function getStickyPostId (): Promise<number | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const data = await wpQuery(`{ posts(first: 1, where: { isSticky: true }) { nodes { databaseId } } }`)
  return data?.posts?.nodes?.[0]?.databaseId ?? null
}

// Breadcrumb for the blog list. None when the blog is the homepage, since
// Breadcrumbs always starts with Home.
export function blogCrumbs (settings: BlogSettings) {
  const { postsPage } = settings
  return postsPage && postsPage.uri !== '/' ? [{ label: postsPage.title, href: linkTo(postsPage.uri) }] : []
}

export async function getPostsByIds (ids: number[]): Promise<CardPost[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  if (!ids.length) return []
  const data = await wpQuery(
    `query PostsByIds($ids: [ID], $first: Int) {
      posts(first: $first, where: { in: $ids, orderby: { field: IN, order: ASC } }) {
        nodes { ${CARD_FIELDS} }
      }
    }`,
    { ids, first: ids.length }
  )
  return (data?.posts?.nodes ?? []).map(toCard)
}

export async function getCategories (): Promise<(TermLink & { count: number | null })[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const data = await wpQuery(`{
    categories(first: 100, where: { hideEmpty: true, orderby: COUNT, order: DESC }) {
      nodes { databaseId name uri count }
    }
  }`)
  return data?.categories?.nodes ?? []
}

export type MiniPost = { title: string; uri: string; dateGmt: string; image: Image | null }

export async function getPopularPosts (): Promise<MiniPost[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const data = await wpQuery(`{
    posts(first: 4, where: { orderby: { field: COMMENT_COUNT, order: DESC } }) {
      nodes { title uri dateGmt featuredImage { node { ${IMAGE_FIELDS} } } }
    }
  }`)
  return (data?.posts?.nodes ?? []).map(
    (post: { title: string; uri: string; dateGmt: string; featuredImage: { node: Image } | null }) => ({
      title: post.title,
      uri: post.uri,
      dateGmt: post.dateGmt,
      image: post.featuredImage?.node ?? null
    })
  )
}

export async function getTags (): Promise<TermLink[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const data = await wpQuery(`{
    tags(first: 20, where: { orderby: COUNT, order: DESC, hideEmpty: true }) { nodes { name uri } }
  }`)
  return data?.tags?.nodes ?? []
}

export type SinglePost = {
  databaseId: number
  title: string
  uri: string
  content: string // with heading ids
  headings: Heading[]
  excerpt: string // plain text
  dateGmt: string
  modifiedGmt: string | null
  minutes: number
  commentStatus: string | null
  image: Image | null
  author: { databaseId: number; name: string; uri: string | null; description: string | null; avatar: string | null } | null
  categories: TermLink[]
  tags: TermLink[]
}

export async function getPost (uri: string): Promise<SinglePost | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts', `post:${uri}`)
  const data = await wpQuery(
    `query Post($uri: ID!) {
      post(id: $uri, idType: URI) {
        databaseId
        title
        uri
        status
        content
        excerpt
        dateGmt
        modifiedGmt
        commentStatus
        featuredImage { node { ${IMAGE_FIELDS} caption } }
        author { node { databaseId name uri description avatar(size: 160) { url } } }
        categories(first: 10) { nodes { databaseId name uri } }
        tags(first: 30) { nodes { name uri } }
      }
    }`,
    { uri }
  )
  const post = data?.post
  if (!post || post.status !== 'publish') return null
  const { html, headings } = addHeadingIds(post.content ?? '')
  return {
    databaseId: post.databaseId,
    title: post.title,
    uri: post.uri,
    content: html,
    headings,
    excerpt: textFromHtml(post.excerpt).replace(/\s*\[…\]$/, '…'),
    dateGmt: post.dateGmt,
    modifiedGmt: post.modifiedGmt,
    minutes: readingMinutes(post.content),
    commentStatus: post.commentStatus,
    image: post.featuredImage?.node ?? null,
    author: post.author?.node
      ? {
          databaseId: post.author.node.databaseId,
          name: post.author.node.name,
          uri: post.author.node.uri ?? null,
          description: post.author.node.description,
          avatar: post.author.node.avatar?.url ?? null
        }
      : null,
    categories: post.categories?.nodes ?? [],
    tags: post.tags?.nodes ?? []
  }
}

type Adjacent = { title: string; uri: string } | null

// WPGraphQL core has no previous/next fields. A post's cursor is
// base64("arrayconnection:<id>"), and cursor pagination keeps the default
// date order, so the neighbours are one step after/before that cursor.
export async function getAdjacentPosts (databaseId: number): Promise<{ previous: Adjacent; next: Adjacent }> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const cursor = Buffer.from(`arrayconnection:${databaseId}`).toString('base64')
  const data = await wpQuery(
    `query Adjacent($cursor: String) {
      older: posts(first: 1, after: $cursor) { nodes { title uri } }
      newer: posts(last: 1, before: $cursor) { nodes { title uri } }
    }`,
    { cursor }
  )
  return {
    previous: data?.older?.nodes?.[0] ?? null,
    next: data?.newer?.nodes?.[0] ?? null
  }
}

export async function getRelatedPosts (categoryIds: number[], excludeId: number): Promise<CardPost[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  if (!categoryIds.length) return []
  const data = await wpQuery(
    `query Related($cats: [ID], $not: [ID]) {
      posts(first: 3, where: { categoryIn: $cats, notIn: $not }) { nodes { ${CARD_FIELDS} } }
    }`,
    { cats: categoryIds, not: [excludeId] }
  )
  return (data?.posts?.nodes ?? []).map(toCard)
}

type RawComment = {
  databaseId: number
  parentDatabaseId: number | null
  content: string | null
  dateGmt: string
  author: { node: { name: string | null; avatar: { url: string } | null; databaseId?: number } | null } | null
}

type CommentsData = {
  post: { comments: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: RawComment[] } | null } | null
}

export type CommentData = {
  id: number
  parentId: number
  content: string
  dateGmt: string
  author: { name: string; avatar: string | null; userId: number | null }
}

// Approved comments only (WPGraphQL hides the rest from guests), oldest first.
// rawQuery (no fetch cache) so revalidateTag(`comments:<id>`) after a new
// approved comment isn't undone by wpQuery's 60-second fetch cache.
export async function getComments (postId: number): Promise<CommentData[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`comments:${postId}`)
  const comments: CommentData[] = []
  let after: string | null = null
  for (let batch = 0; batch < 10; batch++) {
    const json: { data?: CommentsData; errors?: { message: string }[] } = await rawQuery<CommentsData>(
      `query Comments($id: ID!, $after: String) {
        post(id: $id, idType: DATABASE_ID) {
          comments(first: 100, after: $after, where: { orderby: COMMENT_DATE_GMT, order: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes {
              databaseId
              parentDatabaseId
              content
              dateGmt
              author { node { name avatar { url } ... on User { databaseId } } }
            }
          }
        }
      }`,
      { id: postId, after }
    )
    if (json.errors?.length) throw new Error(json.errors[0].message)
    const connection: NonNullable<CommentsData['post']>['comments'] | undefined = json.data?.post?.comments
    for (const node of connection?.nodes ?? []) {
      comments.push({
        id: node.databaseId,
        parentId: node.parentDatabaseId || 0,
        content: node.content ?? '',
        dateGmt: node.dateGmt,
        author: {
          name: node.author?.node?.name || 'অতিথি',
          avatar: node.author?.node?.avatar?.url ?? null,
          userId: node.author?.node?.databaseId ?? null
        }
      })
    }
    if (!connection?.pageInfo?.hasNextPage) break
    after = connection.pageInfo.endCursor
  }
  return comments
}

// For generateStaticParams: published pages, recent posts and the posts page
export async function getStaticUris (): Promise<string[]> {
  'use cache'
  cacheLife('hours')
  try {
    const data = await wpQuery(`{
      pages(first: 100) { nodes { uri isFrontPage } }
      posts(first: 50) { nodes { uri } }
    }`)
    const pages = (data?.pages?.nodes ?? [])
      .filter((page: { uri: string | null; isFrontPage: boolean }) => page.uri && !page.isFrontPage)
      .map((page: { uri: string }) => page.uri)
    // The posts page (and any unpublished node) has `uri: null`; skip those
    const posts = (data?.posts?.nodes ?? [])
      .map((post: { uri: string | null }) => post.uri)
      .filter(Boolean) as string[]
    const { postsPage } = await getBlogSettings()
    // A blog on "/" is app/page.tsx, not a catch-all URI
    return [...pages, ...posts, ...(postsPage && postsPage.uri !== '/' ? [postsPage.uri] : [])]
  } catch {
    return []
  }
}

export type Author = {
  databaseId: number
  name: string
  uri: string
  description: string | null
  avatar: string | null
  website: string | null
  jobTitle: string | null
  experience: string | null
  social: { facebook: string | null; x: string | null; linkedin: string | null }
  commentTotal: number
}

// Author archive header: profile (core fields + ACF "Author Profile",
// wp-content/themes/lekhoni/inc/acf-author.php) and the comments on their posts
export async function getAuthor (id: number): Promise<Author | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts', `author:${id}`)
  const data = await wpQuery(
    `query Author($id: ID!, $author: Int) {
      user(id: $id, idType: DATABASE_ID) {
        databaseId
        name
        uri
        url
        description
        avatar(size: 320) { url }
        authorProfile { jobTitle experience facebook xUrl linkedin }
      }
      posts(first: 100, where: { author: $author }) { nodes { commentCount } }
    }`,
    { id, author: id }
  )
  const user = data?.user
  if (!user) return null
  // WordPress fills "Website" with the site address by default; that isn't a personal site
  let website: string | null = user.url || null
  try {
    if (website && new URL(website).origin === new URL(process.env.WP_GRAPHQL_URL ?? '').origin) website = null
  } catch {}
  const profile = user.authorProfile ?? {}
  return {
    databaseId: user.databaseId,
    name: user.name,
    uri: user.uri,
    description: user.description || null,
    avatar: user.avatar?.url ?? null,
    website,
    jobTitle: profile.jobTitle || null,
    experience: profile.experience || null,
    social: { facebook: profile.facebook || null, x: profile.xUrl || null, linkedin: profile.linkedin || null },
    commentTotal: (data?.posts?.nodes ?? []).reduce(
      (sum: number, node: { commentCount: number | null }) => sum + (node.commentCount ?? 0),
      0
    )
  }
}
