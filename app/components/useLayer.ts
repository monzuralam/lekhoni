'use client'

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react'

// Port of openLayer() from design/assets/js/main.js, shared by every dialog
// (cart drawer, quick view): focus trap, Escape, overlay click, scroll lock
// and focus restore. Spread the returned props on the overlay element.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useLayer<T extends HTMLElement = HTMLButtonElement> (onClose: () => void) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const initialFocusRef = useRef<T>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const root = document.documentElement
    root.style.overflow = 'hidden'
    initialFocusRef.current?.focus()
    return () => {
      root.style.overflow = ''
      previous?.focus?.()
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !overlayRef.current) return
    const items = Array.from(
      overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter(item => item.offsetParent !== null)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return { overlayProps: { ref: overlayRef, onKeyDown, onClick }, initialFocusRef }
}
