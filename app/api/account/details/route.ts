import { authQuery, getAuthToken, plainMessage, rawQuery, setSession } from '@/lib/auth'
import { normalizePhone } from '@/app/components/checkout/validation'
import { readDetailsFields, validateDetails } from '@/app/components/account/details'

type LoginResult = { login: { authToken: string; refreshToken: string } | null }

const LOGIN = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) { authToken refreshToken }
  }
`

const UPDATE = `
  mutation UpdateDetails($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer { firstName lastName displayName email billing { phone } }
    }
  }
`

type UpdatedCustomer = {
  firstName: string | null
  lastName: string | null
  displayName: string | null
  email: string | null
  billing: { phone: string | null } | null
}

// POST /api/account/details { name, displayName, phone, email, current, password, confirm }
// -> { ok, details, passwordChanged } | { error, fieldErrors? }
// updateCustomer doesn't ask for the current password, so it is checked here
// with the `login` mutation before a new one is saved (the design asks for it).
export async function POST (request: Request) {
  const body = (await request.json().catch(() => null)) ?? {}
  const fields = readDetailsFields(body)
  const fieldErrors = validateDetails(fields)
  if (Object.keys(fieldErrors).length) {
    return Response.json({ error: 'ফর্মের তথ্যগুলো ঠিক করুন।', fieldErrors }, { status: 400 })
  }

  if (!(await getAuthToken({ persist: true }))) {
    return Response.json({ error: 'সেশনের মেয়াদ শেষ হয়ে গেছে, আবার লগইন করুন।' }, { status: 401 })
  }

  const changePassword = Boolean(fields.password)
  if (changePassword) {
    const me = await authQuery<{ customer: { username: string | null; email: string | null } | null }>(
      '{ customer { username email } }',
      {},
      { persist: true }
    )
    const username = me.data?.customer?.username || me.data?.customer?.email
    if (!username) {
      return Response.json({ error: 'সেশনের মেয়াদ শেষ হয়ে গেছে, আবার লগইন করুন।' }, { status: 401 })
    }
    const check = await rawQuery<LoginResult>(LOGIN, { username, password: fields.current })
    if (!check.data?.login?.authToken) {
      const message = 'বর্তমান পাসওয়ার্ড সঠিক নয়।'
      return Response.json({ error: message, fieldErrors: { current: message } }, { status: 400 })
    }
  }

  const name = fields.name.trim().replace(/\s+/g, ' ')
  const split = name.lastIndexOf(' ')
  const email = fields.email.trim()
  const input = {
    firstName: split > 0 ? name.slice(0, split) : name,
    lastName: split > 0 ? name.slice(split + 1) : '',
    displayName: fields.displayName.trim() || name,
    email,
    billing: { phone: normalizePhone(fields.phone) },
    ...(changePassword ? { password: fields.password } : {})
  }

  const json = await authQuery<{ updateCustomer: { customer: UpdatedCustomer | null } | null }>(
    UPDATE,
    { input },
    { persist: true }
  )
  const customer = json.data?.updateCustomer?.customer
  if (json.errors || !customer) {
    const detail = json.errors ? plainMessage(json.errors[0].message) : ''
    return Response.json(
      { error: detail ? `তথ্য সংরক্ষণ করা যায়নি: ${detail}` : 'তথ্য সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।' },
      { status: 422 }
    )
  }

  // Sign in again with the new password so the session keeps working even if
  // WordPress invalidated the old tokens
  if (changePassword) {
    const fresh = await rawQuery<LoginResult>(LOGIN, { username: email, password: fields.password })
    const tokens = fresh.data?.login
    if (tokens?.authToken) await setSession(tokens.authToken, tokens.refreshToken)
  }

  return Response.json({
    ok: true,
    passwordChanged: changePassword,
    details: {
      name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
      displayName: customer.displayName ?? '',
      phone: customer.billing?.phone ?? '',
      email: customer.email ?? ''
    }
  })
}
