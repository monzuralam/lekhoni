'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode
} from 'react'

// Port of initTabs() from design/assets/js/main.js: arrow-key tablist, the
// active tab mirrored in ?tab=, and links elsewhere on the page with
// data-tab-link="reviews" that switch tab and scroll here.

export type ProductTab = {
  key: string
  label: string
  panel: ReactNode
  // Panel width: text panels are capped at max-w-3xl like the design
  wide?: boolean
}

const PARAM = 'tab'
const noop = () => () => {}

export default function ProductTabs ({ tabs }: { tabs: ProductTab[] }) {
  const scope = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  // ?tab= from the URL on first load (null during SSR, so no mismatch)
  const fromUrl = useSyncExternalStore(
    noop,
    () => new URLSearchParams(location.search).get(PARAM),
    () => null
  )
  const [chosen, setChosen] = useState<string | null>(null)
  const keys = tabs.map(tab => tab.key)
  const active = chosen ?? (fromUrl && keys.includes(fromUrl) ? fromUrl : keys[0])

  const select = (key: string, focus = false) => {
    setChosen(key)
    if (focus) tabRefs.current[keys.indexOf(key)]?.focus()
    const query = new URLSearchParams(location.search)
    query.set(PARAM, key)
    history.replaceState(history.state, '', `${location.pathname}?${query}${location.hash}`)
  }
  // Latest values for the document listener below
  const latest = useRef({ select, keys })
  useEffect(() => {
    latest.current = { select, keys }
  })

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.('[data-tab-link]')
      const key = link?.getAttribute('data-tab-link')
      if (!key || !latest.current.keys.includes(key)) return
      e.preventDefault()
      latest.current.select(key, true)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scope.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % keys.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + keys.length) % keys.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = keys.length - 1
    if (next === -1) return
    e.preventDefault()
    select(keys[next], true)
  }

  return (
    <section
      ref={scope}
      id='product-tabs'
      aria-label='পণ্যের বিস্তারিত তথ্য'
      className='mx-auto mt-14 w-full max-w-site scroll-mt-36 px-4 sm:px-6'
    >
      <div role='tablist' aria-label='পণ্যের তথ্য' className='scrollbar-none flex overflow-x-auto border-b border-line'>
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            ref={node => {
              tabRefs.current[index] = node
            }}
            type='button'
            role='tab'
            id={`ptab-${tab.key}`}
            aria-controls={`ppanel-${tab.key}`}
            aria-selected={tab.key === active}
            tabIndex={tab.key === active ? 0 : -1}
            onClick={() => select(tab.key)}
            onKeyDown={e => onKeyDown(e, index)}
            className='whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-[0.95rem] font-semibold text-ink-2 transition hover:text-link aria-selected:border-accent aria-selected:text-link'
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.key}
          role='tabpanel'
          id={`ppanel-${tab.key}`}
          aria-labelledby={`ptab-${tab.key}`}
          tabIndex={0}
          hidden={tab.key !== active}
          className={tab.wide ? 'pt-8' : 'max-w-3xl pt-8'}
        >
          {tab.panel}
        </div>
      ))}
    </section>
  )
}
