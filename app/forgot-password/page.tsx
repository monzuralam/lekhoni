import type { Metadata } from 'next'
import AuthCard, { BackToLogin } from '../components/auth/AuthCard'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'পাসওয়ার্ড ভুলে গেছেন?',
  robots: { index: false }
}

export default function Page () {
  return (
    <AuthCard
      icon='mail'
      title='পাসওয়ার্ড ভুলে গেছেন?'
      description='চিন্তা নেই। আপনার অ্যাকাউন্টের ইমেইল ঠিকানাটি দিন, আমরা রিসেট লিংক পাঠিয়ে দেব।'
    >
      <ForgotPasswordForm />
      <BackToLogin />
    </AuthCard>
  )
}
