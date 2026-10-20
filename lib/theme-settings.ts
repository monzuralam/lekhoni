import { createHash } from 'node:crypto'
import { cacheLife, cacheTag } from 'next/cache'
import { wpQuery } from './wp'
import { bn } from './bn'
import { toSiteTime } from './site-time'

// The theme's global settings (wp-admin → Theme Settings, defined in
// wp-content/themes/lekhoni/inc/acf-settings.php) for the header, footer,
// announcement bar and blog sidebar, plus the Site Title and Site Icon.
//
// One cached request, shared by every component. Empty fields fall back to
// the design's defaults, and switches that were never saved count as on, so
// an untouched settings page renders exactly like the design. Saving the
// settings calls /api/revalidate (tag 'theme-settings'), which refreshes it.

export const SOCIAL_NETWORKS = {
  facebook: 'ফেসবুক',
  x: 'এক্স',
  instagram: 'ইনস্টাগ্রাম',
  youtube: 'ইউটিউব',
  linkedin: 'লিংকডইন',
  rss: 'RSS ফিড'
} as const

export type SocialNetwork = keyof typeof SOCIAL_NETWORKS
export type SocialLink = { network: SocialNetwork; label: string; url: string }

export type LogoImage = { src: string; alt: string; width: number; height: number }

export type SiteLink = { label: string; href: string; external: boolean }

export type Announcement = {
  // Changes with the content, so a new message shows again for visitors who
  // closed the old one
  id: string
  icon: string | null
  text: string
  link: SiteLink | null
  dismissible: boolean
  startsAt: string | null // ISO
  endsAt: string | null // ISO
}

// Theme Settings → Branding → Style (see globals.css: [data-preset])
export type StylePreset = 'default' | 'ecommerce' | 'cosmetics'

export type TopicSource = 'categories' | 'tags' | 'product_categories'

export type ThemeSettings = {
  siteTitle: string
  siteIcon: { small: string; large: string } | null
  logo: { light: LogoImage; dark: LogoImage | null; width: number } | null
  style: { preset: StylePreset; accent: string | null }
  announcement: Announcement | null
  social: SocialLink[]
  header: { social: boolean; search: boolean; wishlist: boolean; account: boolean; themeToggle: boolean }
  // Theme Settings → Login (off unless switched on)
  login: { emailLink: boolean; linkLifetime: number }
  footer: {
    about: { title: string; text: string; showSocial: boolean } | null
    recentPosts: { title: string; count: number } | null
    topics: { title: string; source: TopicSource; count: number } | null
    links: { title: string } | null
    paymentBadges: string[]
    copyright: string
  }
}

const DEFAULTS = {
  siteTitle: 'লেখনী',
  announcementText: '৳১,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি',
  announcementLink: { label: 'আজই অর্ডার করুন', href: '/shop' },
  announcementIcon: 'truck',
  logoWidth: 160,
  aboutTitle: 'লেখনী সম্পর্কে',
  aboutText: 'হেডলেস ওয়ার্ডপ্রেস, GraphQL আর Next.js নিয়ে বাংলায় লেখা, সঙ্গে লেখালেখির পছন্দের জিনিসপত্রের ছোট্ট দোকান।',
  postsTitle: 'সাম্প্রতিক লেখা',
  postsCount: 4,
  topicsTitle: 'বিষয়',
  topicsCount: 8,
  linksTitle: 'দরকারি লিংক',
  paymentBadges: ['ক্যাশ অন ডেলিভারি', 'বিকাশ', 'নগদ', 'ভিসা/মাস্টারকার্ড'],
  copyright: '© {year} {site} · WordPress ও Next.js দিয়ে তৈরি'
}

type RawImage = {
  node: { sourceUrl: string; altText: string | null; mediaDetails: { width: number | null; height: number | null } | null }
} | null

const IMAGE = 'node { sourceUrl altText mediaDetails { width height } }'

const QUERY = `{
  generalSettings { title timezone }
  siteIcon { small large }
  themeSettings {
    themeOptions {
      branding { logo { ${IMAGE} } logoDark { ${IMAGE} } logoWidth }
      style { preset accentColor }
      announcement { enabled dismissible icon text linkLabel linkUrl startsAt endsAt }
      socialLinks { network url }
      header { showSocial showSearch showWishlist showAccount showThemeToggle }
      login { emailLink linkLifetime }
      footer {
        about { enabled title text showSocial }
        recentPosts { enabled title count }
        topics { enabled title source count }
        links { enabled title }
        bottom { showPaymentBadges copyright paymentBadges { label } }
      }
    }
  }
}`

// Switches that were never saved come back null: treat them as on
const on = (value: boolean | null | undefined) => value !== false

// ACF select fields come back from GraphQL as a list (["truck"])
const first = (value: string[] | string | null | undefined) => (Array.isArray(value) ? value[0] : value) || null

const text = (value: string | null | undefined, fallback: string) => value?.trim() || fallback

const clamp = (value: number | null | undefined, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value as number))) : fallback

function toImage (raw: RawImage): LogoImage | null {
  const node = raw?.node
  if (!node?.sourceUrl) return null
  return {
    src: node.sourceUrl,
    alt: node.altText ?? '',
    width: node.mediaDetails?.width || 320,
    height: node.mediaDetails?.height || 80
  }
}

// "/shop" or "shop" -> internal path; full URLs to the WordPress host become
// paths too; other sites stay external
export function toLink (label: string, url: string): SiteLink | null {
  const value = url.trim()
  if (!label || !value || value === '#') return null
  try {
    const wpOrigin = new URL(process.env.WP_GRAPHQL_URL ?? '').origin
    const parsed = new URL(value, wpOrigin)
    if (/^https?:/i.test(value) && parsed.origin !== wpOrigin) {
      return { label, href: parsed.href, external: true }
    }
    if (/^(mailto|tel):/i.test(value)) return { label, href: value, external: true }
    const path = parsed.pathname.replace(/\/+$/, '') || '/'
    return { label, href: `${path}${parsed.search}${parsed.hash}`, external: false }
  } catch {
    return value.startsWith('/') ? { label, href: value, external: false } : null
  }
}

function isSocialNetwork (value: string | null): value is SocialNetwork {
  return !!value && value in SOCIAL_NETWORKS
}

function safeUrl (value: string | null | undefined) {
  try {
    const url = new URL(value ?? '')
    return /^https?:$/.test(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export async function getThemeSettings (): Promise<ThemeSettings> {
  'use cache'
  cacheLife('minutes')
  cacheTag('theme-settings')

  let data
  try {
    data = await wpQuery(QUERY, {}, { tags: ['theme-settings'] })
  } catch {
    data = null // WordPress unreachable: render the design defaults
  }
  const options = data?.themeSettings?.themeOptions ?? {}
  const timezone: string = data?.generalSettings?.timezone || '+00:00'
  const siteTitle = text(data?.generalSettings?.title, DEFAULTS.siteTitle)

  // Branding
  const light = toImage(options.branding?.logo ?? null)
  const dark = toImage(options.branding?.logoDark ?? null)
  const logo = light
    ? { light, dark, width: clamp(options.branding?.logoWidth, 40, 400, DEFAULTS.logoWidth) }
    : null

  // Style preset and accent override (#rgb or #rrggbb only: it goes into a style attribute)
  const preset = first(options.style?.preset)
  const accent = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(options.style?.accentColor ?? '') ? options.style.accentColor as string : null

  // Announcement bar
  const ann = options.announcement ?? {}
  let announcement: Announcement | null = null
  if (on(ann.enabled)) {
    const annText = text(ann.text, DEFAULTS.announcementText)
    const link = ann.text?.trim()
      ? toLink(ann.linkLabel?.trim() ?? '', ann.linkUrl ?? '')
      : toLink(text(ann.linkLabel, DEFAULTS.announcementLink.label), text(ann.linkUrl, DEFAULTS.announcementLink.href))
    const startsAt = ann.startsAt ? toSiteTime(ann.startsAt, timezone) : null
    const endsAt = ann.endsAt ? toSiteTime(ann.endsAt, timezone) : null
    announcement = {
      id: createHash('sha1').update(JSON.stringify([annText, link?.label, link?.href])).digest('hex').slice(0, 10),
      icon: ann.icon === undefined ? DEFAULTS.announcementIcon : first(ann.icon),
      text: annText,
      link,
      dismissible: on(ann.dismissible),
      startsAt,
      endsAt
    }
  }

  // Social profiles (only networks the storefront has icons for)
  const social: SocialLink[] = (options.socialLinks ?? []).flatMap(
    (row: { network: string[] | string | null; url: string | null }) => {
      const network = first(row.network)
      const url = safeUrl(row.url)
      return isSocialNetwork(network) && url ? [{ network, label: SOCIAL_NETWORKS[network], url }] : []
    }
  )

  // Header
  const header = options.header ?? {}

  // Footer
  const footer = options.footer ?? {}
  const about = footer.about ?? {}
  const posts = footer.recentPosts ?? {}
  const topics = footer.topics ?? {}
  const links = footer.links ?? {}
  const bottom = footer.bottom ?? {}
  const source = first(topics.source)
  const badges: string[] = (bottom.paymentBadges ?? [])
    .map((row: { label: string | null }) => row.label?.trim() ?? '')
    .filter(Boolean)

  return {
    siteTitle,
    siteIcon: data?.siteIcon?.small ? data.siteIcon : null,
    logo,
    style: { preset: preset === 'ecommerce' || preset === 'cosmetics' ? preset : 'default', accent },
    announcement,
    social,
    header: {
      social: on(header.showSocial),
      search: on(header.showSearch),
      wishlist: on(header.showWishlist),
      account: on(header.showAccount),
      themeToggle: on(header.showThemeToggle)
    },
    login: {
      // Off by default, unlike the other switches
      emailLink: options.login?.emailLink === true,
      linkLifetime: clamp(options.login?.linkLifetime, 5, 60, 15)
    },
    footer: {
      about: on(about.enabled)
        ? { title: text(about.title, DEFAULTS.aboutTitle), text: text(about.text, DEFAULTS.aboutText), showSocial: on(about.showSocial) }
        : null,
      recentPosts: on(posts.enabled)
        ? { title: text(posts.title, DEFAULTS.postsTitle), count: clamp(posts.count, 1, 8, DEFAULTS.postsCount) }
        : null,
      topics: on(topics.enabled)
        ? {
            title: text(topics.title, DEFAULTS.topicsTitle),
            source: source === 'tags' || source === 'product_categories' ? source : 'categories',
            count: clamp(topics.count, 1, 20, DEFAULTS.topicsCount)
          }
        : null,
      links: on(links.enabled) ? { title: text(links.title, DEFAULTS.linksTitle) } : null,
      paymentBadges: on(bottom.showPaymentBadges) ? (badges.length ? badges : DEFAULTS.paymentBadges) : [],
      // The year is resolved here, inside the cache, so pages stay static
      copyright: text(bottom.copyright, DEFAULTS.copyright)
        .replaceAll('{year}', bn(new Date().getFullYear()))
        .replaceAll('{site}', siteTitle)
    }
  }
}
