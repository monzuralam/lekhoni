'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { EMPTY_CART, type Cart } from '@/lib/cart-types'
import CartDrawer from './CartDrawer'

// Shared cart state: the header button reads `cart.count` and opens the
// drawer, product cards call `addItem`. The cart itself lives in WooCommerce,
// reached via /api/cart.

type ToastType = 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType; leaving?: boolean }

type CartContextValue = {
  cart: Cart | null // null until the first load finishes
  busyKey: string | null // cart line currently being updated
  isOpen: boolean
  open: () => void
  close: () => void
  // Variable products: pass the chosen variationId, plus attributes
  // ({ pa_size: 'large' }) for any attribute the variation leaves as "any"
  addItem: (
    productId: number,
    name: string,
    quantity?: number,
    variationId?: number,
    attributes?: Record<string, string>
  ) => Promise<boolean>
  // Several simple products at once (routine bundles); one toast for all
  addItems: (items: { productId: number; quantity?: number }[], label: string) => Promise<boolean>
  setQuantity: (key: string, quantity: number) => Promise<void>
  removeItem: (key: string, name: string) => Promise<void>
  // Cart page / checkout. applyCoupon resolves to a Bangla error message, or
  // null when the coupon was applied.
  applyCoupon: (code: string) => Promise<string | null>
  removeCoupon: (code: string) => Promise<void>
  setShipping: (methods: string[]) => Promise<void> // one rate id per package
  setAddress: (address: { country: string; state?: string; city?: string }) => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart () {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}

async function request (method: string, body?: object, path = '/api/cart') {
  const res = await fetch(path, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error)
  return data as Cart
}

export default function CartProvider ({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, type: ToastType) => {
    const id = nextId.current++
    setToasts(list => [...list, { id, message, type }])
    // Same timing as the design: show 3.2s, then a 220ms leave transition
    setTimeout(() => {
      setToasts(list => list.map(t => (t.id === id ? { ...t, leaving: true } : t)))
      setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 220)
    }, 3200)
  }, [])

  useEffect(() => {
    let cancelled = false
    request('GET')
      .then(data => !cancelled && setCart(data))
      .catch(() => !cancelled && setCart(EMPTY_CART))
    return () => {
      cancelled = true
    }
  }, [])

  const addItem = useCallback(
    async (
      productId: number,
      name: string,
      quantity = 1,
      variationId?: number,
      attributes?: Record<string, string>
    ) => {
      try {
        setCart(await request('POST', { productId, quantity, variationId, attributes }))
        toast(`${name} কার্টে যোগ হয়েছে`, 'success')
        setIsOpen(true)
        return true
      } catch {
        toast('কার্টে যোগ করা যায়নি, আবার চেষ্টা করুন', 'error')
        return false
      }
    },
    [toast]
  )

  const addItems = useCallback(
    async (items: { productId: number; quantity?: number }[], label: string) => {
      let latest: Cart | null = null
      try {
        // One at a time: every request updates the same WooCommerce session
        for (const item of items) {
          latest = await request('POST', { productId: item.productId, quantity: item.quantity ?? 1 })
        }
        if (latest) setCart(latest)
        toast(`${label} কার্টে যোগ হয়েছে`, 'success')
        setIsOpen(true)
        return true
      } catch {
        if (latest) setCart(latest)
        toast('সবগুলো পণ্য কার্টে যোগ করা যায়নি, আবার চেষ্টা করুন', 'error')
        return false
      }
    },
    [toast]
  )

  const setQuantity = useCallback(
    async (key: string, quantity: number) => {
      setBusyKey(key)
      try {
        setCart(await request('PATCH', { key, quantity }))
      } catch {
        toast('পরিমাণ পরিবর্তন করা যায়নি', 'error')
      } finally {
        setBusyKey(null)
      }
    },
    [toast]
  )

  const removeItem = useCallback(
    async (key: string, name: string) => {
      setBusyKey(key)
      try {
        setCart(await request('DELETE', { key }))
        toast(`${name} কার্ট থেকে সরানো হয়েছে`, 'success')
      } catch {
        toast('পণ্যটি সরানো যায়নি', 'error')
      } finally {
        setBusyKey(null)
      }
    },
    [toast]
  )

  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        setCart(await request('POST', { code }, '/api/cart/coupon'))
        toast('কুপন প্রয়োগ হয়েছে', 'success')
        return null
      } catch (error) {
        return (error as Error).message || 'কুপনটি প্রয়োগ করা যায়নি।'
      }
    },
    [toast]
  )

  const removeCoupon = useCallback(
    async (code: string) => {
      try {
        setCart(await request('DELETE', { code }, '/api/cart/coupon'))
        toast('কুপন সরানো হয়েছে', 'success')
      } catch {
        toast('কুপনটি সরানো যায়নি', 'error')
      }
    },
    [toast]
  )

  const setShipping = useCallback(
    async (methods: string[]) => {
      try {
        setCart(await request('POST', { methods }, '/api/cart/shipping'))
      } catch {
        toast('ডেলিভারি পদ্ধতি পরিবর্তন করা যায়নি', 'error')
      }
    },
    [toast]
  )

  const setAddress = useCallback(
    async (address: { country: string; state?: string; city?: string }) => {
      try {
        setCart(await request('PUT', address, '/api/cart/shipping'))
      } catch {
        // Rates just stay as they were
      }
    },
    []
  )

  const refresh = useCallback(async () => {
    try {
      setCart(await request('GET'))
    } catch {
      setCart(EMPTY_CART)
    }
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        cart,
        busyKey,
        isOpen,
        open,
        close,
        addItem,
        addItems,
        setQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        setShipping,
        setAddress,
        refresh
      }}
    >
      {children}
      {isOpen && <CartDrawer />}
      <div
        role='status'
        aria-live='polite'
        className='pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4 print:hidden'
      >
        {toasts.map(t => (
          <div
            key={t.id}
            data-leaving={t.leaving || undefined}
            className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lift animate-toast-in transition duration-200 data-leaving:translate-y-2 data-leaving:opacity-0 ${t.type === 'error' ? 'border-danger/40' : 'border-line'}`}
          >
            {t.type === 'error' ? (
              <span className='grid size-7 shrink-0 place-items-center rounded-full bg-danger/15 text-danger'>
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-close' />
                </svg>
              </span>
            ) : (
              <span className='grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success'>
                <svg className='icon size-4' aria-hidden='true'>
                  <use href='#i-check' />
                </svg>
              </span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </CartContext.Provider>
  )
}
