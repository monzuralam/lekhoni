'use client'

import { useSyncExternalStore } from 'react'
import { STORAGE_KEY, THEME_COLORS } from './theme'

// Port of initTheme() from design/assets/js/main.js. The theme lives on
// <html data-theme>: THEME_SCRIPT (in the root layout) sets it before the
// first paint (see ./theme.ts) from localStorage or the system preference, and
// every toggle on the page reads and writes that attribute, so they stay in sync.

function subscribe (onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark'

function setTheme (theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
}

export default function ThemeToggle ({ className }: { className: string }) {
  // Server render has no theme; the icons swap with CSS (dark:), so only the
  // label and pressed state update after hydration
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  return (
    <button
      type='button'
      data-theme-toggle
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-pressed={dark}
      aria-label={dark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
      className={className}
    >
      <svg className='icon size-5 dark:hidden' aria-hidden='true'>
        <use href='#i-moon' />
      </svg>
      <svg className='icon size-5 hidden dark:block' aria-hidden='true'>
        <use href='#i-sun' />
      </svg>
    </button>
  )
}
