import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import AnnouncementBar from './components/AnnouncementBar'
import Icons from './components/Icons'
import Header from './components/Header'
import Footer from './components/Footer'
import { wpQuery } from '@/lib/wp'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const siteMeta = async () =>
  await wpQuery(`{
  allSettings {
    generalSettingsTitle
    generalSettingsDescription
  }
}`)

export async function generateMetadata (): Promise<Metadata> {
  const data = await siteMeta()

  return {
    title: data?.allSettings?.generalSettingsTitle ?? 'লেখনী',
    description:
      data?.allSettings?.generalSettingsDescription ??
      'নোটবুক, কলম, মগ, টোট ব্যাগ ও গিফট বক্স। ৳১,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি সুবিধা।'
  }
}

export default function RootLayout ({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='group/body'>
        <Icons />
        <AnnouncementBar />
        <Header />
        <main id='main' tabIndex={-1} className='focus:outline-none'>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
