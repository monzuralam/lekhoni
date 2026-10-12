'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { bn } from '@/lib/bn'

// COMPONENT: ReaderControls. Port of initReaderControls() in
// design/assets/js/main.js: text size (--reader-scale on <html>, saved as JSON
// in localStorage "lk-reader-scale", 90–130%) and focus mode (body[data-reading],
// which the layout's group-data-reading/body:hidden classes react to; Esc exits).

const KEY = 'lk-reader-scale'
const MIN = 0.9
const MAX = 1.3

const listeners = new Set<() => void>()
const clamp = (value: number) => Math.min(MAX, Math.max(MIN, Math.round(value * 100) / 100))

function readScale () {
  try {
    const raw = localStorage.getItem(KEY)
    return raw == null ? 1 : clamp(Number(JSON.parse(raw)) || 1)
  } catch {
    return 1
  }
}

function writeScale (value: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable: the size just isn't remembered */
  }
  listeners.forEach(listener => listener())
}

function subscribe (listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

const button =
  'grid size-9 place-items-center rounded-full text-sm font-semibold text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'

export default function ReaderControls () {
  const scale = useSyncExternalStore(subscribe, readScale, () => 1)
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty('--reader-scale', String(scale))
  }, [scale])

  useEffect(() => {
    document.body.toggleAttribute('data-reading', focus)
    if (!focus) return
    const onKey = (event: KeyboardEvent) => {
      // Leave Esc to open dialogs/drawers (they set aria-modal)
      if (event.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) setFocus(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      // Never leave the rest of the site in focus mode after navigating away
      document.body.removeAttribute('data-reading')
    }
  }, [focus])

  return (
    <div role='group' aria-label='পড়ার সুবিধা' className='inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-1 print:hidden'>
      <button type='button' aria-label='লেখা ছোট করুন' disabled={scale <= MIN} onClick={() => writeScale(clamp(scale - 0.1))} className={button}>
        অ−
      </button>
      <span aria-live='polite' className='min-w-12 text-center text-xs text-muted'>
        {bn(Math.round(scale * 100))}%
      </span>
      <button type='button' aria-label='লেখা বড় করুন' disabled={scale >= MAX} onClick={() => writeScale(clamp(scale + 0.1))} className={`${button} text-base`}>
        অ+
      </button>
      <button type='button' aria-label='লেখার আকার আগের মতো করুন' onClick={() => writeScale(1)} className={button}>
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-rotate-ccw' />
        </svg>
      </button>
      <span aria-hidden='true' className='mx-1 h-5 w-px bg-line' />
      <button
        type='button'
        aria-pressed={focus}
        onClick={() => setFocus(on => !on)}
        className='inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-link aria-pressed:bg-accent aria-pressed:text-accent-ink'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-book' />
        </svg>
        ফোকাস মোড
      </button>
    </div>
  )
}
