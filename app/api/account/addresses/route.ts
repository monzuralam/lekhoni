import { authQuery, getAuthToken, plainMessage } from '@/lib/auth'
import {
  ADDRESS_GRAPHQL,
  readAddressFields,
  toAddressInput,
  toFields,
  validateAddress,
  type AddressType,
  type CustomerAddress
} from '@/app/components/account/address'

const UPDATE = `
  mutation UpdateAddress($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        billing { ${ADDRESS_GRAPHQL} email }
        shipping { ${ADDRESS_GRAPHQL} }
      }
    }
  }
`

// POST /api/account/addresses { type: 'billing' | 'shipping', name, phone, email,
// division, district, thana, address } -> { address } | { error, fieldErrors? }
// Same fields and rules as checkout.
export async function POST (request: Request) {
  const body = (await request.json().catch(() => null)) ?? {}
  const type: AddressType | null = body.type === 'billing' || body.type === 'shipping' ? body.type : null
  if (!type) return Response.json({ error: 'ঠিকানার ধরন সঠিক নয়।' }, { status: 400 })

  const fields = readAddressFields(body)
  const fieldErrors = validateAddress(fields, type)
  if (Object.keys(fieldErrors).length) {
    return Response.json({ error: 'ফর্মের তথ্যগুলো ঠিক করুন।', fieldErrors }, { status: 400 })
  }

  if (!(await getAuthToken({ persist: true }))) {
    return Response.json({ error: 'সেশনের মেয়াদ শেষ হয়ে গেছে, আবার লগইন করুন।' }, { status: 401 })
  }

  const json = await authQuery<{
    updateCustomer: { customer: { billing: CustomerAddress | null; shipping: CustomerAddress | null } | null } | null
  }>(UPDATE, { input: { [type]: toAddressInput(fields, type) } }, { persist: true })

  const customer = json.data?.updateCustomer?.customer
  if (json.errors || !customer) {
    const detail = json.errors ? plainMessage(json.errors[0].message) : ''
    return Response.json(
      { error: detail ? `ঠিকানা সংরক্ষণ করা যায়নি: ${detail}` : 'ঠিকানা সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।' },
      { status: 422 }
    )
  }

  return Response.json({ address: toFields(customer[type]) })
}
