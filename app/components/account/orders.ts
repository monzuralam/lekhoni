import { bn } from '@/lib/bn'
import { formatPrice } from '@/lib/products'

// Order list helpers shared by the server pages, /api/account/orders and the
// client "load more" list.

export const ORDER_GRAPHQL = `
  databaseId
  orderNumber
  date
  status
  total
  lineItems { nodes { quantity } }
`

export type RawOrderRow = {
  databaseId: number
  orderNumber: string | null
  date: string | null
  status: string | null
  total: string | null
  lineItems: { nodes: { quantity: number | null }[] } | null
}

// Serializable row for the table (already formatted)
export type OrderRow = {
  id: number
  number: string
  date: string | null // ISO-ish date from WooGraphQL
  status: string
  total: string
  items: number
}

export function toOrderRow (order: RawOrderRow): OrderRow {
  return {
    id: order.databaseId,
    number: order.orderNumber ?? String(order.databaseId),
    date: order.date,
    status: order.status ?? '',
    total: formatPrice(order.total),
    items: (order.lineItems?.nodes ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  }
}

// WooCommerce order statuses in Bangla, with the design's badge colours
const STATUSES: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'পেমেন্টের অপেক্ষায়', className: 'bg-star/20 text-ink' },
  PROCESSING: { label: 'প্রক্রিয়াধীন', className: 'bg-star/20 text-ink' },
  ON_HOLD: { label: 'স্থগিত', className: 'bg-star/20 text-ink' },
  COMPLETED: { label: 'সম্পন্ন', className: 'bg-success/15 text-success' },
  CANCELLED: { label: 'বাতিল', className: 'bg-danger/15 text-danger' },
  FAILED: { label: 'ব্যর্থ', className: 'bg-danger/15 text-danger' },
  REFUNDED: { label: 'ফেরত দেওয়া হয়েছে', className: 'bg-surface-2 text-ink-2' },
  CHECKOUT_DRAFT: { label: 'খসড়া', className: 'bg-surface-2 text-ink-2' }
}

export function orderStatus (status: string | null | undefined) {
  const key = (status ?? '').toUpperCase().replace(/-/g, '_')
  return STATUSES[key] ?? { label: status || 'অজানা', className: 'bg-accent/15 text-link' }
}

const MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
]

const DHAKA_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

// WooGraphQL dates look like "2026-10-12T08:30:00+00:00"
export function orderDate (value: string | null | undefined) {
  // Dates with an offset (WooGraphQL returns UTC) are shown in Bangladesh
  // time, so the day is the same on the server and in the browser
  let text = value ?? ''
  const time = /[+-]\d{2}:?\d{2}$|Z$/.test(text) ? new Date(text) : null
  if (time && !Number.isNaN(time.getTime())) text = DHAKA_DATE.format(time) // YYYY-MM-DD
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return { iso: '', label: '' }
  const [, year, month, day] = match
  return {
    iso: `${year}-${month}-${day}`,
    label: `${bn(Number(day))} ${MONTHS[Number(month) - 1]}, ${bn(year)}`
  }
}
