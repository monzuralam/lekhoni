import { getAuthToken, isSignedIn, rawQuery } from '@/lib/auth'
import type { AuthCustomer } from '../helpers'

// GET /api/auth/me -> { signedIn: boolean, customer?: { databaseId, firstName, email } }
export async function GET () {
  if (!(await isSignedIn())) return Response.json({ signedIn: false })

  // Refreshes an expired auth token (and clears dead sessions) as a side effect
  const token = await getAuthToken({ persist: true })
  if (!token) return Response.json({ signedIn: false })

  try {
    const json = await rawQuery<{ customer: AuthCustomer | null }>(
      '{ customer { databaseId firstName email } }',
      {},
      token
    )
    const customer = json.data?.customer
    if (!customer?.databaseId) return Response.json({ signedIn: false })
    return Response.json({
      signedIn: true,
      customer: {
        databaseId: customer.databaseId,
        firstName: customer.firstName ?? null,
        email: customer.email ?? null
      }
    })
  } catch {
    return Response.json({ signedIn: false }, { status: 502 })
  }
}
