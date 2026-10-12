import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import AnnouncementBar from './components/AnnouncementBar'
import Icons from './components/Icons'
import Header from './components/Header'
import Footer from './components/Footer'
import CartProvider from './components/cart/CartProvider'
import SearchPalette from './components/search/SearchPalette'
import { THEME_SCRIPT } from './components/header/theme'
import { ANNOUNCEMENT_SCRIPT } from './components/announcement'
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

// Browser UI colour; THEME_SCRIPT and the toggle switch it for dark mode
export const viewport: Viewport = {
  themeColor: '#faf8f5'
}

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
    // suppressHydrationWarning: THEME_SCRIPT sets data-theme before React hydrates
    <html
      lang='en'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Apply the saved theme before the CSS loads to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Keep a dismissed announcement bar hidden from the first paint */}
        <script dangerouslySetInnerHTML={{ __html: ANNOUNCEMENT_SCRIPT }} />
      </head>
      <body className='group/body'>
        <Icons />
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main id='main' tabIndex={-1} className='focus:outline-none'>
            {children}
          </main>
          <Footer />
        </CartProvider>
        {/* Opens from the header search button, Ctrl/Cmd+K or "/" */}
        <SearchPalette />
      </body>
    </html>
  )
}
