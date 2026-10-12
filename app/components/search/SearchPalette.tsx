'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLayer } from '../useLayer'

// Port of initCommandPalette() from design/assets/js/main.js. Opens from any
// [data-search-open] button (the header's search icon), Ctrl/Cmd+K, or "/"
// when not typing. Results come live from /api/search (WordPress + WooCommerce).

type Result = { type: 'product' | 'category' | 'post' | 'page'; title: string; url: string; text: string }

const TYPE_LABEL: Record<Result['type'], string> = {
  product: 'পণ্য',
  category: 'বিষয়',
  post: 'পোস্ট',
  page: 'পেজ'
}

const searchHref = (query: string) => (query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')

// Wrap the matching part of the title in <mark>
function highlight (text: string, query: string): ReactNode {
  const q = query.trim()
  const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (index === -1) return text
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  )
}

export default function SearchPalette () {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('[data-search-open]')) setOpen(true)
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      } else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return open ? createPortal(<Palette onClose={() => setOpen(false)} />, document.body) : null
}

function Palette ({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { overlayProps, initialFocusRef } = useLayer<HTMLInputElement>(onClose)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [suggestions, setSuggestions] = useState(true)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  // Debounced live search; the newest request wins
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        const data = await res.json()
        setResults(data.results ?? [])
        setSuggestions(Boolean(data.suggestions))
        setFailed(!res.ok)
        setActive(data.results?.length ? 0 : -1)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        setResults([])
        setFailed(true)
        setActive(-1)
      }
      setLoading(false)
    }, query.trim() ? 200 : 0)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Keep the highlighted option in view
  useEffect(() => {
    listRef.current?.querySelector(`#search-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = useCallback(
    (url: string) => {
      onClose()
      router.push(url)
    },
    [onClose, router]
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault()
      setActive(index => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault()
      setActive(index => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (results[active]) go(results[active].url)
      else if (query.trim()) go(searchHref(query))
    }
  }

  return (
    <div
      {...overlayProps}
      className='fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm print:hidden'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='সাইটে খুঁজুন'
        className='w-full max-w-xl overflow-hidden rounded-card border border-line bg-surface shadow-lift animate-pop'
      >
        <div className='flex items-center gap-3 border-b border-line px-4'>
          {loading && query.trim() ? (
            <span aria-hidden='true' className='size-5 shrink-0 animate-spin rounded-full border-2 border-line border-t-accent' />
          ) : (
            <svg className='icon size-5 shrink-0 text-muted' aria-hidden='true'>
              <use href='#i-search' />
            </svg>
          )}
          <input
            ref={initialFocusRef}
            type='text'
            role='combobox'
            aria-expanded='true'
            aria-controls='search-palette-list'
            aria-autocomplete='list'
            aria-activedescendant={active >= 0 ? `search-option-${active}` : undefined}
            aria-label='সাইটে খুঁজুন'
            placeholder='পোস্ট, পেজ বা পণ্য খুঁজুন…'
            autoComplete='off'
            spellCheck={false}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className='h-14 w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none'
          />
          <button
            type='button'
            onClick={onClose}
            aria-label='বন্ধ করুন'
            className='rounded-lg border border-line px-2 py-1 font-mono text-xs text-muted transition hover:text-ink'
          >
            Esc
          </button>
        </div>

        <ul ref={listRef} id='search-palette-list' role='listbox' aria-label='ফলাফল' className='max-h-[50vh] overflow-y-auto p-2'>
          {suggestions && results.length > 0 && (
            <li role='presentation' className='px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-widest text-muted'>
              জনপ্রিয় বিষয়
            </li>
          )}
          {!loading && !results.length && (
            <li role='presentation' className='px-4 py-8 text-center text-sm text-muted'>
              {failed
                ? 'এই মুহূর্তে খোঁজা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।'
                : query.trim().length === 1
                  ? 'আরেকটু লিখুন…'
                  : 'কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।'}
            </li>
          )}
          {results.map((result, index) => (
            <li
              key={`${result.type}-${result.url}`}
              id={`search-option-${index}`}
              role='option'
              aria-selected={index === active}
              onMouseMove={() => index !== active && setActive(index)}
              onClick={() => go(result.url)}
              className='group/opt flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 aria-selected:bg-surface-2'
            >
              <span className='shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-link'>
                {TYPE_LABEL[result.type]}
              </span>
              <span className='min-w-0 flex-1 truncate text-sm font-medium text-ink'>{highlight(result.title, query)}</span>
              <svg className='icon size-4 text-muted opacity-0 group-aria-selected/opt:opacity-100' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </li>
          ))}
        </ul>

        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-surface-2 px-4 py-2 text-xs text-muted'>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> বাছাই
          </span>
          <span>
            <kbd>Enter</kbd> খুলুন
          </span>
          <span>
            <kbd>Esc</kbd> বন্ধ
          </span>
          <Link href={searchHref(query)} onClick={onClose} className='ml-auto font-medium text-link hover:underline'>
            সব ফলাফল দেখুন
          </Link>
        </div>
      </div>
    </div>
  )
}
