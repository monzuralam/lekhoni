import type { Metadata } from 'next'
import Image from 'next/image'
import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'
import { plainText } from '@/lib/products'
import PageHeader from './PageHeader'
import type { Crumb } from './Breadcrumbs'

// A plain WordPress page: title, featured image and editor content. Used by
// the catch-all route and by the homepage when the static front page doesn't
// use the Home Shop template.

export type WpPage = {
  title: string
  content: string | null
  uri: string
  isFrontPage: boolean
  modified: string | null
  featuredImage: {
    node: {
      sourceUrl: string
      altText: string | null
      mediaDetails: { width: number | null; height: number | null } | null
    }
  } | null
  ancestors: { nodes: { title: string; uri: string }[] } | null
}

const PAGE_QUERY = `
  query Page($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      content
      uri
      isFrontPage
      modified
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      ancestors {
        nodes {
          ... on Page {
            title
            uri
          }
        }
      }
    }
  }
`

export async function getPage (uri: string): Promise<WpPage | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('pages', `page:${uri}`)
  try {
    const data = await wpQuery(PAGE_QUERY, { uri })
    return data?.page ?? null
  } catch {
    return null
  }
}

export function pageMetadata (page: WpPage): Metadata {
  const description = plainText(page.content).slice(0, 160) || undefined
  const image = page.featuredImage?.node?.sourceUrl
  return {
    title: page.title,
    description,
    openGraph: { title: page.title, description, images: image ? [image] : undefined }
  }
}

export default function WordPressPage ({ page }: { page: WpPage }) {
  // The front page is the homepage itself, so its breadcrumb would only repeat Home
  const crumbs: Crumb[] = page.isFrontPage
    ? []
    : [
        ...(page.ancestors?.nodes ?? [])
          .slice()
          .reverse()
          .map(ancestor => ({ label: ancestor.title, href: ancestor.uri.replace(/\/+$/, '') || '/' })),
        { label: page.title }
      ]
  const image = page.featuredImage?.node

  return (
    <>
      <PageHeader title={page.title} breadcrumbs={crumbs} />
      <article className='mx-auto w-full max-w-site px-4 sm:px-6 mt-10 max-w-3xl'>
        {image && (
          <Image
            src={image.sourceUrl}
            alt={image.altText || ''}
            width={image.mediaDetails?.width || 1200}
            height={image.mediaDetails?.height || 675}
            sizes='(min-width: 768px) 720px, 100vw'
            unoptimized={/\.svg(\?|$)/i.test(image.sourceUrl)}
            priority
            className='mb-8 aspect-video w-full rounded-card border border-line object-cover'
          />
        )}
        {page.content ? (
          // Editor content from WordPress (trusted, written by site admins)
          <div className='entry-content prose' dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <p className='text-ink-2'>এই পাতায় এখনো কিছু লেখা হয়নি।</p>
        )}
      </article>
    </>
  )
}
