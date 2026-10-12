'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MenuItem } from './menu'
import { useNav } from './NavProvider'

// Port of initNavigation() from design/assets/js/main.js: submenu toggles
// (one open branch per level), outside click / Escape to close, and the
// current-page highlight with its ancestors.

// Pages that are not in the menu highlight their parent section instead
const NAV_PARENTS: [RegExp, string][] = [
  [/^\/(product|product-category|cart|checkout|order-received)(\/|$)/, '/shop']
]

const normalize = (path: string) => path.replace(/\/+$/, '') || '/'

function findActive (items: MenuItem[], pathname: string) {
  const path = normalize(pathname)
  const all: { item: MenuItem; trail: string[] }[] = []
  const walk = (list: MenuItem[], trail: string[]) =>
    list.forEach(item => {
      all.push({ item, trail: [...trail, item.id] })
      walk(item.children, [...trail, item.id])
    })
  walk(items, [])

  const internal = all.filter(({ item }) => item.href && !item.external)
  const match = (target: string) =>
    internal.find(({ item }) => normalize(item.href!.split(/[?#]/)[0]) === target)

  const exact = match(path)
  if (exact) return { currentId: exact.item.id, trail: exact.trail }
  const parent = NAV_PARENTS.find(([pattern]) => pattern.test(path))?.[1]
  const section = parent ? match(parent) : undefined
  return { currentId: null, trail: section?.trail ?? [] }
}

const TOP_LABEL =
  'flex items-center rounded-full px-3 py-2 text-[0.95rem] font-medium text-ink-2 transition hover:text-link aria-[current=page]:text-link data-active:text-link max-nav:flex-1 max-nav:px-1'
const SUB_LABEL =
  'block flex-1 rounded-lg px-3 py-2 text-sm text-ink-2 transition hover:bg-surface-2 hover:text-link aria-[current=page]:font-semibold aria-[current=page]:text-link data-active:text-link'
const L1_PANEL =
  'max-nav:mb-2 max-nav:ml-2 max-nav:hidden max-nav:border-l max-nav:border-line max-nav:pl-2 max-nav:group-data-open/l1:block nav:invisible nav:absolute nav:left-0 nav:top-full nav:z-50 nav:min-w-52 nav:translate-y-1 nav:rounded-card nav:border nav:border-line nav:bg-surface nav:p-2 nav:opacity-0 nav:shadow-lift nav:transition nav:duration-200 nav:group-hover/l1:visible nav:group-hover/l1:translate-y-0 nav:group-hover/l1:opacity-100 nav:group-focus-within/l1:visible nav:group-focus-within/l1:translate-y-0 nav:group-focus-within/l1:opacity-100 nav:group-data-open/l1:visible nav:group-data-open/l1:translate-y-0 nav:group-data-open/l1:opacity-100'
const L2_PANEL =
  'max-nav:mb-1 max-nav:ml-2 max-nav:hidden max-nav:border-l max-nav:border-line max-nav:pl-2 max-nav:group-data-open/l2:block nav:invisible nav:absolute nav:left-full nav:-top-2 nav:z-50 nav:min-w-48 nav:rounded-card nav:border nav:border-line nav:bg-surface nav:p-2 nav:opacity-0 nav:shadow-lift nav:transition nav:duration-200 nav:group-hover/l2:visible nav:group-hover/l2:opacity-100 nav:group-focus-within/l2:visible nav:group-focus-within/l2:opacity-100 nav:group-data-open/l2:visible nav:group-data-open/l2:opacity-100'

type NavMenuProps = {
  items: MenuItem[]
  children?: ReactNode // mobile-only actions under the menu
}

export default function NavMenu ({ items, children }: NavMenuProps) {
  const { open: mobileOpen, setOpen: setMobileOpen, toggleRef } = useNav()
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  // Ids of the open submenu branch, one per level. Stored with the page it
  // was opened on, so navigating closes every submenu.
  const [branch, setBranch] = useState<{ on: string; path: string[] }>({ on: pathname, path: [] })
  const openPath = branch.on === pathname ? branch.path : []
  const setOpenPath = (update: string[] | ((path: string[]) => string[])) =>
    setBranch(current => {
      const path = current.on === pathname ? current.path : []
      return { on: pathname, path: typeof update === 'function' ? update(path) : update }
    })

  const { currentId, trail } = findActive(items, pathname)
  // As in the design, the last dropdown opens to the left so it stays on screen
  const lastIndex = items.length - 1

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setBranch(b => ({ ...b, path: [] }))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const toggle = (depth: number, id: string) =>
    setOpenPath(path => (path[depth] === id ? path.slice(0, depth) : [...path.slice(0, depth), id]))

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    const openItem = (e.target as HTMLElement).closest<HTMLElement>('li[data-open]')
    if (openItem) {
      const depth = Number(openItem.dataset.depth)
      setOpenPath(path => path.slice(0, depth))
      openItem.querySelector<HTMLButtonElement>('[data-submenu-toggle]')?.focus()
    } else if (mobileOpen) {
      setMobileOpen(false)
      toggleRef.current?.focus()
    }
  }

  const renderLabel = (item: MenuItem, depth: number, hasChildren: boolean) => {
    const className = `${depth === 0 ? TOP_LABEL : SUB_LABEL}${item.href ? '' : ' cursor-default'}`
    const active = trail.includes(item.id) && item.id !== currentId
    const common = {
      'data-menu-label': hasChildren || undefined,
      'data-active': active || undefined,
      className
    }
    if (!item.href) return <span {...common}>{item.label}</span>
    const rel = item.target === '_blank' ? 'noopener noreferrer' : undefined
    if (item.external) {
      return (
        <a {...common} href={item.href} target={item.target ?? undefined} rel={rel}>
          {item.label}
        </a>
      )
    }
    return (
      <Link
        {...common}
        href={item.href}
        target={item.target ?? undefined}
        rel={rel}
        aria-current={item.id === currentId ? 'page' : undefined}
      >
        {item.label}
      </Link>
    )
  }

  const renderItem = (item: MenuItem, depth: number, index: number) => {
    const hasChildren = item.children.length > 0
    const isOpen = openPath[depth] === item.id
    // Design styles two submenu levels; deeper levels reuse the second
    const group = depth === 0 ? 'group/l1' : 'group/l2'

    if (!hasChildren) {
      return (
        <li key={item.id} className={depth === 0 ? 'max-nav:border-b max-nav:border-line' : undefined}>
          {renderLabel(item, depth, false)}
        </li>
      )
    }

    return (
      <li
        key={item.id}
        data-depth={depth}
        data-open={isOpen || undefined}
        className={`${group} relative${depth === 0 ? ' max-nav:border-b max-nav:border-line' : ''}`}
      >
        <div className='flex items-center'>
          {renderLabel(item, depth, true)}
          <button
            type='button'
            data-submenu-toggle
            onClick={() => toggle(depth, item.id)}
            aria-expanded={isOpen}
            aria-label={`${item.label} সাবমেনু`}
            className={`grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-link ${depth === 0 ? 'nav:-ml-2.5 nav:size-6' : 'nav:size-7'}`}
          >
            <svg
              className={`icon size-4 transition duration-200 ${depth === 0 ? 'group-data-open/l1:rotate-180' : 'max-nav:group-data-open/l2:rotate-180 nav:-rotate-90'}`}
              aria-hidden='true'
            >
              <use href='#i-chevron-down' />
            </svg>
          </button>
        </div>
        <ul
          className={
            depth === 0
              ? `${L1_PANEL}${index === lastIndex ? ' nav:left-auto nav:right-0' : ''}`
              : L2_PANEL
          }
        >
          {item.children.map((child, i) => renderItem(child, depth + 1, i))}
        </ul>
      </li>
    )
  }

  return (
    <nav
      ref={navRef}
      id='site-nav'
      aria-label='প্রধান মেনু'
      data-open={mobileOpen || undefined}
      onKeyDown={onKeyDown}
      className='group-data-reading/body:hidden max-nav:hidden max-nav:max-h-[calc(100dvh-5rem)] max-nav:overflow-y-auto max-nav:border-t max-nav:border-line max-nav:py-2 max-nav:data-open:block nav:pb-2'
    >
      <ul data-menu className='flex max-nav:flex-col nav:items-center nav:justify-center nav:gap-1'>
        {items.map((item, index) => renderItem(item, 0, index))}
      </ul>
      {children}
    </nav>
  )
}
