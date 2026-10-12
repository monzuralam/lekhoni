'use client'

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject
} from 'react'
import { usePathname } from 'next/navigation'

// Mobile menu open state, shared by the burger button in the header bar and
// the <nav> below it (port of setNav() in design/assets/js/main.js)

type NavContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggleRef: RefObject<HTMLButtonElement | null>
}

const NavContext = createContext<NavContextValue | null>(null)

export function useNav () {
  const context = useContext(NavContext)
  if (!context) throw new Error('useNav must be used inside <NavProvider>')
  return context
}

// Reports the current path. usePathname suspends while prerendering routes
// with dynamic params (/my-account/orders/[id]), so this leaf sits in its own
// <Suspense> and the header around it stays in the static shell.
function PathnameWatcher ({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname()
  useEffect(() => onChange(pathname), [pathname, onChange])
  return null
}

export default function NavProvider ({ children }: { children: ReactNode }) {
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [pathname, setPathname] = useState('')
  // Remember which page the menu was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null)

  return (
    <NavContext.Provider value={{ open, setOpen, toggleRef }}>
      <Suspense fallback={null}>
        <PathnameWatcher onChange={setPathname} />
      </Suspense>
      {children}
    </NavContext.Provider>
  )
}

export function NavToggle () {
  const { open, setOpen, toggleRef } = useNav()

  return (
    <button
      ref={toggleRef}
      type='button'
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-controls='site-nav'
      aria-label={open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
      className='relative inline-flex size-10 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link group/burger nav:hidden'
    >
      <svg className='icon size-5 group-aria-expanded/burger:hidden' aria-hidden='true'>
        <use href='#i-menu' />
      </svg>
      <svg className='icon size-5 hidden group-aria-expanded/burger:block' aria-hidden='true'>
        <use href='#i-close' />
      </svg>
    </button>
  )
}
