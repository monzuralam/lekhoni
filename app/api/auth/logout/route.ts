import { cookies } from 'next/headers'
import { clearSession } from '@/lib/auth'

// POST /api/auth/logout -> { ok: true }
export async function POST () {
  await clearSession()
  // The WooCommerce session (lib/cart.ts) belongs to the customer now; drop it
  // so the next visitor on this browser starts with an empty guest cart.
  // The customer's cart stays saved in their account.
  const store = await cookies()
  store.delete('woo-session')
  return Response.json({ ok: true })
}
