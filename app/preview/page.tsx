import type { Metadata } from 'next'
import { PreviewExpired } from '../components/preview/PreviewExpired'

// Where /api/preview sends an expired, used or invalid preview link

export const metadata: Metadata = {
  title: 'প্রিভিউ',
  robots: { index: false, follow: false }
}

export default function Page () {
  return <PreviewExpired />
}
