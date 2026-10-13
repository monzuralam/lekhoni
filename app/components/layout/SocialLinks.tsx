import type { SocialLink } from '@/lib/theme-settings'

// Social profile icons from Theme Settings → Social Profiles. External links
// open in a new tab. Renders nothing when no profile is set.

const VARIANTS = {
  // Header, left side
  header: {
    list: 'flex items-center gap-0.5',
    link: 'grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-link',
    icon: 'icon size-4.5'
  },
  // Footer "About" column
  footer: {
    list: 'mt-4 flex flex-wrap gap-2',
    link: 'grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-accent hover:text-link',
    icon: 'icon size-4'
  }
}

type SocialLinksProps = {
  links: SocialLink[]
  variant: keyof typeof VARIANTS
  className?: string
}

export default function SocialLinks ({ links, variant, className = '' }: SocialLinksProps) {
  if (!links.length) return null
  const styles = VARIANTS[variant]

  return (
    <ul aria-label='সামাজিক যোগাযোগ' className={`${styles.list} ${className}`}>
      {links.map(link => (
        <li key={`${link.network}-${link.url}`}>
          <a href={link.url} target='_blank' rel='noopener noreferrer me' aria-label={link.label} className={styles.link}>
            <svg className={styles.icon} aria-hidden='true'>
              <use href={`#i-${link.network}`} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
