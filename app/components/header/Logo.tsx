import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { LogoImage, ThemeSettings } from '@/lib/theme-settings'

// Logo from Theme Settings → Branding: the logo image (with an optional
// dark-mode version), else the Site Title as the design's text logo
// "লেখনী." Used in the header (shrinks once the page scrolls) and footer.

const VARIANTS = {
  header: {
    text: 'font-serif text-3xl font-bold leading-none text-ink transition-[font-size] duration-300 group-data-scrolled/body:text-2xl nav:text-4xl nav:group-data-scrolled/body:text-3xl',
    // --logo-w is the width set in Theme Settings
    image: 'h-auto w-[calc(var(--logo-w)*0.75)] transition-[width] duration-300 nav:w-(--logo-w) nav:group-data-scrolled/body:w-[calc(var(--logo-w)*0.8)]'
  },
  footer: {
    text: 'font-serif text-2xl font-bold text-ink',
    image: 'h-auto w-[calc(var(--logo-w)*0.75)]'
  }
}

function LogoImg ({ image, className, priority }: { image: LogoImage; className: string; priority: boolean }) {
  return (
    <Image
      src={image.src}
      alt=''
      width={image.width}
      height={image.height}
      priority={priority}
      unoptimized={/\.svg(\?|$)/i.test(image.src)}
      className={className}
    />
  )
}

type LogoProps = {
  settings: Pick<ThemeSettings, 'logo' | 'siteTitle'>
  variant?: keyof typeof VARIANTS
}

export default function Logo ({ settings, variant = 'header' }: LogoProps) {
  const { logo, siteTitle } = settings
  const styles = VARIANTS[variant]
  const label = `${siteTitle}, হোম পেজ`

  if (!logo) {
    return (
      <Link href='/' aria-label={label} className={styles.text}>
        {siteTitle}
        <span className='text-link'>.</span>
      </Link>
    )
  }

  const priority = variant === 'header'
  return (
    <Link
      href='/'
      aria-label={label}
      className='inline-flex shrink-0 items-center'
      style={{ '--logo-w': `${logo.width}px` } as CSSProperties}
    >
      <LogoImg image={logo.light} priority={priority} className={`${styles.image}${logo.dark ? ' dark:hidden' : ''}`} />
      {logo.dark && <LogoImg image={logo.dark} priority={false} className={`${styles.image} hidden dark:block`} />}
    </Link>
  )
}
