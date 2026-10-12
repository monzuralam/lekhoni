import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '../components/auth/AuthCard'
import RegisterForm from '../components/auth/RegisterForm'
import RedirectIfSignedIn from '../components/auth/RedirectIfSignedIn'

export const metadata: Metadata = {
  title: 'নতুন অ্যাকাউন্ট খুলুন',
  robots: { index: false }
}

export default function Page () {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthCard
        icon='user'
        title='নতুন অ্যাকাউন্ট খুলুন'
        description='এক মিনিটেই হয়ে যাবে। অর্ডার ট্র্যাক করা আর দ্রুত চেকআউটের সুবিধা পাবেন।'
      >
        <RegisterForm />
      </AuthCard>
    </>
  )
}
