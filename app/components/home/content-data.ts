import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from '@/lib/wp'

// Content sections of the home page "Home Shop" ACF group (wp-content/themes/lekhoni/inc/acf-home.php),
// read from the front page (uri "/"). Cached; tag 'home-content'.

export type AcfImage = {
  node: {
    sourceUrl: string
    altText: string | null
    mediaDetails: { width: number | null; height: number | null } | null
  }
} | null

export type AcfLink = { url: string | null; title: string | null; target: string | null } | null

export type PromoBanner = {
  eyebrow: string | null
  title: string | null
  text: string | null
  style: string[] | string | null
  link: AcfLink
  image: AcfImage
}

export type HomeContent = {
  promoSection: { title: string | null; banners: PromoBanner[] | null } | null
  blogSection: {
    title: string | null
    linkLabel: string | null
    count: number | null
    category: { nodes: { databaseId: number; uri: string | null; name: string }[] } | null
  } | null
  subscribeSection: {
    title: string | null
    text: string | null
    successMessage: string | null
    note: string | null
  } | null
}

const IMAGE_FIELDS = 'node { sourceUrl altText mediaDetails { width height } }'

export async function getHomeContent (): Promise<HomeContent | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('home-content')
  try {
    const data = await wpQuery(`{
      page(id: "/", idType: URI) {
        homeShop {
          promoSection {
            title
            banners {
              eyebrow
              title
              text
              style
              link { url title target }
              image { ${IMAGE_FIELDS} }
            }
          }
          blogSection {
            title
            linkLabel
            count
            category { nodes { databaseId uri name } }
          }
          subscribeSection { title text successMessage note }
        }
      }
    }`)
    return data?.page?.homeShop ?? null
  } catch {
    // WordPress down or the field group missing: sections fall back or hide
    return null
  }
}

// ACF links may be absolute WordPress URLs; same-site ones become storefront paths
export function contentLink (link: AcfLink) {
  if (!link?.url) return null
  let href = link.url
  try {
    const wp = new URL(process.env.WP_SITE_URL ?? process.env.WP_GRAPHQL_URL ?? '')
    const url = new URL(link.url, wp)
    if (url.origin === wp.origin) href = `${url.pathname.replace(/\/+$/, '') || '/'}${url.search}${url.hash}`
  } catch {}
  return {
    href,
    label: link.title || '',
    target: link.target || undefined,
    rel: link.target === '_blank' ? 'noopener noreferrer' : undefined,
    external: /^https?:\/\//.test(href)
  }
}
