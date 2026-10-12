'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

// Grid/list view toggle (design/assets/js/main.js initShopFilters -> setView).
// The choice is a per-browser preference, not a filter, so it lives in
// localStorage under the design's 'lk-shop-view' key instead of the URL.

type View = 'grid' | 'list'

const KEY = 'lk-shop-view'
const EVENT = 'lk-shop-view-change'

function readView (): View {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '"grid"') === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

function subscribe (callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function setView (view: View) {
  try {
    localStorage.setItem(KEY, JSON.stringify(view))
  } catch {
    /* storage unavailable: the view just does not persist */
  }
  window.dispatchEvent(new Event(EVENT))
}

const useView = () => useSyncExternalStore(subscribe, readView, () => 'grid' as View)

export function ShopGrid ({ children }: { children: ReactNode }) {
  const view = useView()
  return (
    <div
      data-shop-grid
      data-view={view}
      className='group/plist grid grid-cols-2 gap-4 data-[view=list]:grid-cols-1! sm:gap-6 xl:grid-cols-3'
    >
      {children}
    </div>
  )
}

const BUTTONS: { view: View; label: string; icon: string }[] = [
  { view: 'grid', label: 'গ্রিড আকারে দেখুন', icon: '#i-grid' },
  { view: 'list', label: 'তালিকা আকারে দেখুন', icon: '#i-list' }
]

export function ViewToggle () {
  const current = useView()
  return (
    <div role='group' aria-label='দেখার ধরন' className='flex rounded-xl border border-line p-0.5'>
      {BUTTONS.map(({ view, label, icon }) => (
        <button
          key={view}
          type='button'
          data-shop-view={view}
          aria-pressed={current === view}
          aria-label={label}
          onClick={() => setView(view)}
          className='grid size-9 place-items-center rounded-lg text-muted transition hover:text-link aria-pressed:bg-accent aria-pressed:text-accent-ink'
        >
          <svg className='icon size-4' aria-hidden='true'>
            <use href={icon} />
          </svg>
        </button>
      ))}
    </div>
  )
}
