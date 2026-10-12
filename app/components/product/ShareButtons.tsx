'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

// Port of initShare() from design/assets/js/main.js. `path` (e.g. product.uri)
// is joined to the current origin; without it the current page is shared.

type ShareButtonsProps = {
  path?: string
  title: string
}

const NETWORKS = [
  { key: 'facebook', icon: 'facebook', label: 'ফেসবুকে শেয়ার করুন' },
  { key: 'x', icon: 'x', label: 'এক্সে শেয়ার করুন' },
  { key: 'whatsapp', icon: 'chat', label: 'হোয়াটসঅ্যাপে শেয়ার করুন' },
  { key: 'linkedin', icon: 'linkedin', label: 'লিংকডইনে শেয়ার করুন' }
] as const

function shareLink (network: (typeof NETWORKS)[number]['key'], url: string, title: string) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  switch (network) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`
    case 'whatsapp':
      return `https://wa.me/?text=${t}%20${u}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
  }
}

const noop = () => () => {}

const buttonClass =
  'grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-link'

export default function ShareButtons ({ path, title }: ShareButtonsProps) {
  // Browser-only values, read without a hydration mismatch
  const shareUrl = useSyncExternalStore(
    noop,
    () => location.origin + (path ?? location.pathname),
    () => ''
  )
  const canShare = useSyncExternalStore(noop, () => typeof navigator.share === 'function', () => false)
  const [status, setStatus] = useState<'copied' | 'failed' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const flash = (next: 'copied' | 'failed') => {
    setStatus(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(null), 1800)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || location.href)
      flash('copied')
    } catch {
      flash('failed')
    }
  }

  const share = () => {
    navigator.share({ title, url: shareUrl || location.href }).catch(() => {
      /* user cancelled the share sheet */
    })
  }

  return (
    <div className='flex flex-wrap items-center gap-2 print:hidden'>
      {NETWORKS.map(network => (
        <a
          key={network.key}
          href={shareUrl ? shareLink(network.key, shareUrl, title) : '#'}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={network.label}
          className={buttonClass}
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href={`#i-${network.icon}`} />
          </svg>
        </a>
      ))}
      <button
        type='button'
        onClick={copy}
        aria-label={status === 'copied' ? 'লিংক কপি হয়েছে' : 'লিংক কপি করুন'}
        className={`${buttonClass} ${status === 'copied' ? 'border-accent text-link' : ''}`}
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href={status === 'copied' ? '#i-check' : '#i-link'} />
        </svg>
      </button>
      {canShare && (
        <button type='button' onClick={share} aria-label='অন্য অ্যাপে শেয়ার করুন' className={buttonClass}>
          <svg className='icon size-4' aria-hidden='true'>
            <use href='#i-share' />
          </svg>
        </button>
      )}
      <span role='status' className='sr-only'>
        {status === 'copied' ? 'লিংক কপি হয়েছে' : status === 'failed' ? 'লিংক কপি করা যায়নি' : ''}
      </span>
    </div>
  )
}
