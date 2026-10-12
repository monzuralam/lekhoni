import type { NextRequest } from 'next/server'
import { getProductCards } from '@/app/components/product/data'

// GET /api/account/wishlist?ids=108,102 -> ProductCardData[] in that order.
// Live card data for the wishlist page (the list itself lives in the
// browser's localStorage, so this works for guests too).

const MAX_IDS = 60

export async function GET (request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter(id => Number.isInteger(id) && id > 0)
  const unique = [...new Set(ids)].slice(0, MAX_IDS)

  try {
    return Response.json(await getProductCards(unique))
  } catch {
    return Response.json({ error: 'পণ্যগুলো আনা যায়নি' }, { status: 502 })
  }
}
