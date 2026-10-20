'use client'

import { useEffect, useState } from 'react'
import { bn } from '@/lib/bn'

// Port of initCountdown() from design/assets/js/main.js.
// Renders ০০ on the server and starts ticking after hydration.

type CountdownProps = {
  endsAt: string // ISO 8601 with offset
  label: string // spoken end time for screen readers
  // Light boxes for coloured banners (cosmetics offer)
  inverse?: boolean
  text?: string
}

const UNITS = [
  ['d', 'দিন'],
  ['h', 'ঘণ্টা'],
  ['m', 'মিনিট'],
  ['s', 'সেকেন্ড']
] as const

function remaining (end: number) {
  const seconds = Math.floor(Math.max(0, end - Date.now()) / 1000)
  return {
    d: Math.floor(seconds / 86400),
    h: Math.floor((seconds % 86400) / 3600),
    m: Math.floor((seconds % 3600) / 60),
    s: seconds % 60,
    ended: seconds <= 0
  }
}

export default function Countdown ({ endsAt, label, inverse = false, text = 'শেষ হতে বাকি' }: CountdownProps) {
  const end = new Date(endsAt).getTime()
  const [left, setLeft] = useState<ReturnType<typeof remaining> | null>(null)

  useEffect(() => {
    if (Number.isNaN(end)) return
    const tick = () => {
      const next = remaining(end)
      setLeft(next)
      if (next.ended) clearInterval(timer)
    }
    const timer = setInterval(tick, 1000)
    tick()
    return () => clearInterval(timer)
  }, [end])

  if (Number.isNaN(end)) return null

  return (
    <div className='flex items-center gap-3'>
      <p className='sr-only'>অফার শেষ হবে {label}।</p>
      {left?.ended ? (
        <p className='rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold text-ink-2'>
          অফারটি শেষ হয়ে গেছে
        </p>
      ) : (
        <>
          <span aria-hidden='true' className={`text-sm font-medium max-sm:hidden ${inverse ? 'opacity-80' : 'text-ink-2'}`}>
            {text}
          </span>
          <div aria-hidden='true' className='flex items-start gap-1.5'>
            {UNITS.map(([key, name]) => (
              <span key={key} className='flex flex-col items-center'>
                <span className={`grid h-11 min-w-11 place-items-center rounded-xl px-1.5 font-mono text-lg font-bold tabular-nums ${inverse ? 'bg-white/15 text-white' : 'bg-ink text-page'}`}>
                  {bn(String(left?.[key] ?? 0).padStart(2, '0'))}
                </span>
                <span className={`mt-1 text-[0.6875rem] ${inverse ? 'opacity-75' : 'text-muted'}`}>{name}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
