import type { NextRequest } from 'next/server'
import { getAuthToken } from '@/lib/auth'
import { getOrders } from '@/app/components/account/data'

// GET /api/account/orders?after=<cursor> -> { orders, hasNextPage, endCursor }
// The next page of the signed-in customer's orders ("load more").
export async function GET (request: NextRequest) {
  if (!(await getAuthToken({ persist: true }))) {
    return Response.json({ error: 'আবার লগইন করুন।' }, { status: 401 })
  }
  const after = request.nextUrl.searchParams.get('after') || null
  const page = await getOrders(after, { persist: true })
  if (!page) return Response.json({ error: 'অর্ডারগুলো আনা যায়নি, আবার চেষ্টা করুন।' }, { status: 502 })
  return Response.json(page)
}
