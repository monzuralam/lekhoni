import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '../components/auth/AuthCard'
import LoginForm from '../components/auth/LoginForm'
import RedirectIfSignedIn from '../components/auth/RedirectIfSignedIn'

export const metadata: Metadata = {
  title: 'লগইন',
  robots: { index: false }
}

export default function Page () {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthCard icon='user' title='আবার স্বাগতম' description='অর্ডার, ঠিকানা ও পছন্দের তালিকা দেখতে লগইন করুন।'>
        <LoginForm />
      </AuthCard>
    </>
  )
}
