import { DIVISIONS } from '../checkout/locations'
import { normalizePhone, validateField, type CheckoutFields } from '../checkout/validation'

// Customer address <-> the checkout's form fields. Used by the address forms
// and /api/account/addresses, so saved addresses follow the checkout's rules
// (name split, BD state codes, phone normalisation).

export type AddressType = 'billing' | 'shipping'

// WooCommerce CustomerAddress (the fields we use)
export type CustomerAddress = {
  firstName: string | null
  lastName: string | null
  address1: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email?: string | null
}

export type AddressFields = {
  name: string
  phone: string
  email: string
  division: string
  district: string // WooCommerce state code, e.g. BD-13
  thana: string
  address: string
}

export type AddressErrors = Partial<Record<keyof AddressFields, string>>

export const ADDRESS_GRAPHQL = 'firstName lastName address1 city state country phone'

export const ADDRESS_FIELD_ORDER: (keyof AddressFields)[] = [
  'name',
  'phone',
  'email',
  'division',
  'district',
  'thana',
  'address'
]

// The division isn't stored on the customer; find it from the district code
export function divisionOf (code: string | null | undefined) {
  if (!code) return null
  for (const division of DIVISIONS) {
    const district = division.districts.find(d => d.code === code)
    if (district) return { division: division.name, district: district.name }
  }
  return null
}

export function fullName (address: Pick<CustomerAddress, 'firstName' | 'lastName'> | null) {
  return [address?.firstName, address?.lastName].filter(Boolean).join(' ').trim()
}

export function toFields (address: CustomerAddress | null): AddressFields {
  const place = divisionOf(address?.state)
  return {
    name: fullName(address),
    phone: address?.phone ?? '',
    email: address?.email ?? '',
    division: place?.division ?? '',
    district: place ? address!.state! : '',
    thana: address?.city ?? '',
    address: address?.address1 ?? ''
  }
}

// Checkout prefill for a signed-in customer. WooCommerce saves the address of
// every order to the customer, and My account > Addresses edits the same data.
// The place comes from one address (billing, else shipping) so parts of two
// addresses are never mixed; name, phone and email fill gaps from the other
// address and the account. Null when nothing useful is saved.
export function savedAddressFields (
  customer: {
    firstName: string | null
    lastName: string | null
    email: string | null
    billing: CustomerAddress | null
    shipping: CustomerAddress | null
  } | null
): AddressFields | null {
  if (!customer) return null
  const billing = toFields(customer.billing)
  const shipping = toFields(customer.shipping)
  const place = billing.district && billing.address ? billing : shipping.district && shipping.address ? shipping : billing
  const fields: AddressFields = {
    name: billing.name || shipping.name || fullName(customer),
    phone: billing.phone || shipping.phone,
    email: billing.email || customer.email || '',
    division: place.division,
    district: place.district,
    thana: place.thana,
    address: place.address
  }
  return Object.values(fields).some(Boolean) ? fields : null
}

// Same messages and rules as checkout. Billing needs a phone; on the shipping
// address it is optional but must be valid when given. Email is billing only.
export function validateAddressField (
  name: keyof AddressFields,
  values: AddressFields,
  type: AddressType
) {
  if (name === 'email' && type === 'shipping') return ''
  if (name === 'phone' && type === 'shipping' && !values.phone.trim()) return ''
  const fields: CheckoutFields = { ...values, note: '', paymentMethod: 'x' }
  return validateField(name, fields)
}

export function validateAddress (values: AddressFields, type: AddressType) {
  const errors: AddressErrors = {}
  for (const name of ADDRESS_FIELD_ORDER) {
    const message = validateAddressField(name, values, type)
    if (message) errors[name] = message
  }
  return errors
}

export function readAddressFields (source: unknown): AddressFields {
  const data = (source && typeof source === 'object' ? source : {}) as Record<string, unknown>
  const text = (key: string) => (typeof data[key] === 'string' ? (data[key] as string) : '')
  return {
    name: text('name'),
    phone: text('phone'),
    email: text('email'),
    division: text('division'),
    district: text('district'),
    thana: text('thana'),
    address: text('address')
  }
}

// Validated form fields -> CustomerAddressInput (as /api/checkout builds it)
export function toAddressInput (fields: AddressFields, type: AddressType) {
  const name = fields.name.trim().replace(/\s+/g, ' ')
  const split = name.lastIndexOf(' ')
  const phone = fields.phone.trim() ? normalizePhone(fields.phone) : ''
  return {
    firstName: split > 0 ? name.slice(0, split) : name,
    lastName: split > 0 ? name.slice(split + 1) : '',
    phone,
    ...(type === 'billing' ? { email: fields.email.trim() } : {}),
    address1: fields.address.trim(),
    city: fields.thana.trim(),
    state: fields.district,
    country: 'BD'
  }
}
