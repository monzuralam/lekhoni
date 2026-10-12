import { redirect } from 'next/navigation'
import { isSignedIn } from '@/lib/auth'

// /login and /register send signed-in customers to their account.
// Reads cookies, so render it inside <Suspense>.
export default async function RedirectIfSignedIn () {
  if (await isSignedIn()) redirect('/my-account')
  return null
}
