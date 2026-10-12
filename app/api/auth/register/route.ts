import { errorResponse, readBody, signIn, text } from '../helpers'
import { plainMessage, rawQuery } from '@/lib/auth'
import {
  AUTH_MESSAGES,
  MESSAGES,
  isEmail,
  isMobile,
  normalizePhone,
  passwordError
} from '@/app/components/auth/validation'

// POST /api/auth/register { email, password, firstName, lastName?, phone? }
// Registers the customer, then logs in (registerCustomer can't issue tokens
// for a guest request) -> same response as /api/auth/login.
export async function POST (request: Request) {
  const body = await readBody(request)
  const email = text(body, 'email').trim()
  const password = text(body, 'password')
  const firstName = text(body, 'firstName').trim()
  const lastName = text(body, 'lastName').trim()
  const phone = text(body, 'phone').trim()

  if (!firstName) return errorResponse(MESSAGES.required, 400)
  if (!isEmail(email)) return errorResponse(MESSAGES.email, 400)
  if (phone && !isMobile(phone)) return errorResponse(MESSAGES.mobile, 400)
  const invalid = passwordError(password)
  if (invalid) return errorResponse(invalid, 400)

  let json
  try {
    json = await rawQuery<{ registerCustomer: { clientMutationId: string | null } | null }>(
      `mutation Register($input: RegisterCustomerInput!) {
        registerCustomer(input: $input) { clientMutationId }
      }`,
      {
        input: {
          email,
          password,
          firstName,
          lastName: lastName || null,
          billing: {
            firstName,
            lastName: lastName || null,
            email,
            ...(phone ? { phone: normalizePhone(phone) } : {})
          }
        }
      }
    )
  } catch {
    return errorResponse(AUTH_MESSAGES.serverDown, 502)
  }

  // A guest request gets no customer data back, so success = payload without errors
  if (!json.data?.registerCustomer || json.errors?.length) {
    const message = plainMessage(json.errors?.[0]?.message ?? '')
    if (/already registered|already exists|already in use/i.test(message)) {
      return errorResponse(AUTH_MESSAGES.emailTaken, 409)
    }
    if (/email/i.test(message) && /invalid/i.test(message)) return errorResponse(MESSAGES.email, 400)
    return errorResponse(AUTH_MESSAGES.registerFailed, 400)
  }

  const result = await signIn(email, password)
  if ('error' in result) return errorResponse(AUTH_MESSAGES.registeredNoLogin, 500)
  return Response.json({ ok: true, customer: result.customer })
}
