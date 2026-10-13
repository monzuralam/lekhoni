import { addHeadingIds, readingMinutes, textFromHtml } from './format'
import type { Image, SinglePost, TermLink } from './data'

// Kept out of data.ts (whose functions are all 'use cache') so the preview
// page (app/preview) can use it on uncached data.

// A post as WordPress sends it (GraphQL shape; the preview sends the same)
export type RawSinglePost = {
  databaseId: number
  title: string
  uri: string
  content: string | null
  excerpt: string | null
  dateGmt: string
  modifiedGmt: string | null
  commentStatus: string | null
  featuredImage: { node: Image } | null
  author: { node: { databaseId: number; name: string; uri: string | null; description: string | null; avatar: { url: string } | null } | null } | null
  categories: { nodes: TermLink[] } | null
  tags: { nodes: TermLink[] } | null
}

export function toSinglePost (post: RawSinglePost): SinglePost {
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
