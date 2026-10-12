'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '../cart/CartProvider'

const CLASS =
  'mt-1 flex w-full items-center gap-3 rounded-xl border-t border-line px-4 py-2.5 text-left text-[0.95rem] font-medium text-danger transition hover:bg-danger/10 disabled:cursor-wait disabled:opacity-70 max-lg:mt-2'

export default function LogoutButton () {
  const router = useRouter()
  const { refresh } = useCart()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function logout () {
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error()
      // The cart belonged to the customer session: reload the guest cart
      await refresh()
      router.replace('/login')
      router.refresh()
    } catch {
      setError('লগআউট করা যায়নি, আবার চেষ্টা করুন।')
      setPending(false)
    }
  }

  return (
    <>
      <button type='button' onClick={logout} disabled={pending} className={CLASS}>
        <svg className='icon size-4.5' aria-hidden='true'>
          <use href='#i-lock' />
        </svg>
        {pending ? 'লগআউট হচ্ছে…' : 'লগআউট'}
      </button>
      {error && (
        <p role='alert' className='px-4 pb-2 text-sm font-medium text-danger'>
          {error}
        </p>
      )}
    </>
  )
}
