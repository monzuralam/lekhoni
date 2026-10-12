'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

// Port of initTabs() from design/assets/js/main.js for <FeaturedProductsTabs />:
// an arrow-key tablist (Left/Right, Up/Down, Home, End). Every panel is
// rendered on the server; this only toggles which one is visible.

export type HomeTab = {
  key: string
  label: string
  panel: ReactNode
}

type ProductsTabsProps = {
  title: string
  tabs: HomeTab[]
}

export default function ProductsTabs ({ title, tabs }: ProductsTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(tabs[0]?.key)

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % tabs.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = tabs.length - 1
    if (next === -1) return
    e.preventDefault()
    setActive(tabs[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    <section
      data-tabs
      aria-labelledby='featured-products-title'
      className='mx-auto mt-16 w-full max-w-site px-4 sm:px-6'
    >
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <h2 id='featured-products-title' className='text-2xl text-ink sm:text-[1.75rem]'>
          {title}
        </h2>
        {tabs.length > 1 && (
          <div
            role='tablist'
            aria-label='পণ্যের ধরন'
            className='inline-flex rounded-full border border-line bg-surface p-1'
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                ref={node => {
                  tabRefs.current[index] = node
                }}
                type='button'
                role='tab'
                id={`ftab-${tab.key}`}
                data-tab={tab.key}
                aria-controls={`fpanel-${tab.key}`}
                aria-selected={tab.key === active}
                tabIndex={tab.key === active ? 0 : -1}
                onClick={() => setActive(tab.key)}
                onKeyDown={e => onKeyDown(e, index)}
                className='rounded-full px-5 py-2 text-sm font-semibold text-ink-2 transition hover:text-link aria-selected:bg-accent aria-selected:text-accent-ink'
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tabs.map(tab =>
        tabs.length > 1 ? (
          <div
            key={tab.key}
            role='tabpanel'
            id={`fpanel-${tab.key}`}
            aria-labelledby={`ftab-${tab.key}`}
            tabIndex={0}
            hidden={tab.key !== active}
            className='focus-visible:outline-offset-8'
          >
            {tab.panel}
          </div>
        ) : (
          // A single tab needs no tablist
          <div key={tab.key}>{tab.panel}</div>
        )
      )}
    </section>
  )
}
