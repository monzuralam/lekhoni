import type { NextRequest } from 'next/server'
import { getProductCards } from '@/app/components/product/data'

// GET /product/recently-viewed?ids=108,102 -> ProductCardData[] in that order.
// Used by <RecentlyViewed />; keeps the WordPress endpoint server-side.

const MAX_IDS = 12

export async function GET (request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter(id => Number.isInteger(id) && id > 0)
  const unique = [...new Set(ids)].slice(0, MAX_IDS)

  try {
    const products = await getProductCards(unique)
    return Response.json(products)
  } catch {
    return Response.json({ error: 'পণ্যগুলো আনা যায়নি' }, { status: 502 })
  }
}
