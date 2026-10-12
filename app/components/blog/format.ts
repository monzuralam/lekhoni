import { bn } from '@/lib/bn'
import { plainText } from '@/lib/products'

// Formatting helpers shared by the blog components (server and client safe)

const DATE_FORMAT = new Intl.DateTimeFormat('bn-BD', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Dhaka'
})

const ISO_DAY = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Dhaka'
})

// GMT date string from WPGraphQL ("2026-10-07T10:45:33" or "2026-10-07 10:45:33")
const toDate = (gmt: string) => new Date(`${gmt.replace(' ', 'T')}Z`)

// "২৮ সেপ্টেম্বর, ২০২৬" in Dhaka time
export const formatDate = (gmt: string) => DATE_FORMAT.format(toDate(gmt))

// "2026-09-28" for <time datetime>
export const isoDay = (gmt: string) => ISO_DAY.format(toDate(gmt))

// Full ISO timestamp for JSON-LD
export const isoDateTime = (gmt: string) => toDate(gmt).toISOString()

// plainText plus the named entities WordPress puts in excerpts
export function textFromHtml (html: string | null | undefined) {
  return plainText(html)
    .replace(/&hellip;/g, '…')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// About 200 words a minute, at least one
export function readingMinutes (html: string | null | undefined) {
  const words = textFromHtml(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export const minutesLabel = (minutes: number) => `${bn(minutes)} মিনিট`

export type Heading = { id: string; text: string; level: 2 | 3 }

function slugify (text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// Give every h2/h3 in the post an id (keeping existing ones) and list them for the TOC
export function addHeadingIds (html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = []
  const used = new Set<string>()
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs = '', inner: string) => {
    const text = textFromHtml(inner)
    if (!text) return match
    const existing = /\sid\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1]
    let id = existing
    if (!id) {
      const base = slugify(text) || `section-${headings.length + 1}`
      id = base
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    }
    used.add(id)
    headings.push({ id, text, level: level === '2' ? 2 : 3 })
    return existing ? match : `<h${level} id="${id}"${attrs}>${inner}</h${level}>`
  })
  return { html: out, headings }
}

// WordPress URIs end in "/", app links don't: /hello-world/ -> /hello-world
export const linkTo = (uri: string) => uri.replace(/\/+$/, '') || '/'
