'use client'

import { useSyncExternalStore } from 'react'

// Port of the design's wishlist (design/assets/js/main.js, section 26).
// localStorage "lk-wishlist" holds [{ id, name, price, image, url }] in the
// order products were added. Other tabs are kept in sync through the
// `storage` event; this tab through a custom event.

export const STORAGE_KEY = 'lk-wishlist'
const CHANGE_EVENT = 'lk-wishlist-change'

export type WishlistItem = {
  id: number
  name: string
  price: string
  image: string
  url: string
}

const EMPTY: WishlistItem[] = []
let cachedRaw: string | null = null
let cachedList: WishlistItem[] = EMPTY

function readRaw () {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Accepts the design demo's string ids too
function parse (raw: string | null): WishlistItem[] {
  if (!raw) return EMPTY
  try {
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return EMPTY
    const seen = new Set<number>()
    return list.flatMap(item => {
      const id = Number(item && typeof item === 'object' ? item.id : item)
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) return []
      seen.add(id)
      const text = (key: string) => (item && typeof item[key] === 'string' ? item[key] : '')
      return [{ id, name: text('name'), price: String(item?.price ?? ''), image: text('image'), url: text('url') }]
    })
  } catch {
    return EMPTY
  }
}

// Same array instance until the stored value changes (useSyncExternalStore)
function getSnapshot () {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedList = parse(raw)
  }
  return cachedList
}

const getServerSnapshot = () => EMPTY

function subscribe (onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function write (list: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable (private mode): the change is lost */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useWishlist () {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Adds or removes the product. Returns true when it is now on the list.
export function toggleWishlist (item: WishlistItem) {
  const list = getSnapshot()
  const exists = list.some(entry => entry.id === item.id)
  write(exists ? list.filter(entry => entry.id !== item.id) : [...list, item])
  toast(exists ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'পছন্দের তালিকায় যোগ হয়েছে', exists ? 'info' : 'success')
  return !exists
}

export function removeFromWishlist (id: number) {
  write(getSnapshot().filter(entry => entry.id !== id))
  toast('পছন্দের তালিকা থেকে সরানো হয়েছে', 'info')
}

// A small toast like the design's (CartProvider's toasts are internal to it).
// Rendered straight into the DOM because it is fired from event handlers and
// needs no React state; its region sits just above the cart's toasts.
const TOAST_CLASS =
  'pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-toast-in transition duration-200 data-leaving:translate-y-2 data-leaving:opacity-0'
const ICON_CLASS = {
  success: 'grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success',
  info: 'grid size-7 shrink-0 place-items-center rounded-full bg-accent/10 text-link'
}

function toast (message: string, type: 'success' | 'info') {
  let region = document.querySelector<HTMLElement>('[data-wishlist-toasts]')
  if (!region) {
    region = document.createElement('div')
    region.setAttribute('data-wishlist-toasts', '')
    region.setAttribute('role', 'status')
    region.setAttribute('aria-live', 'polite')
    region.className =
      'pointer-events-none fixed inset-x-0 bottom-5 z-[81] flex flex-col items-center gap-2 px-4 print:hidden'
    document.body.append(region)
  }
  const node = document.createElement('div')
  node.className = TOAST_CLASS
  const icon = document.createElement('span')
  icon.className = ICON_CLASS[type]
  icon.innerHTML = `<svg class="icon size-4" aria-hidden="true"><use href="#i-heart"/></svg>`
  const text = document.createElement('span')
  text.textContent = message
  node.append(icon, text)
  region.append(node)
  // Same timing as the design: show 3.2s, then a 220ms leave transition
  setTimeout(() => {
    node.setAttribute('data-leaving', '')
    setTimeout(() => node.remove(), 220)
  }, 3200)
}
