'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, type KeyboardEvent } from 'react'
import { bn } from '@/lib/bn'
import { useCart } from '../cart/CartProvider'
import type { Routine } from './data'

// COMPONENT: RoutineBuilder (design/home-cosmetics.html): one tab per routine
// (morning, night…), its steps, and "add the whole routine". The cart takes
// the bundle discount off automatically once every product is in it
// (wp-content/themes/lekhoni/inc/routines.php).

export default function RoutineBuilder ({ routines }: { routines: Routine[] }) {
  const { addItems } = useCart()
  const [active, setActive] = useState(routines[0]?.key)
  const [pending, setPending] = useState(false)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % routines.length
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + routines.length) % routines.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = routines.length - 1
    if (next === -1) return
    e.preventDefault()
    setActive(routines[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      {routines.length > 1 && (
        <div role='tablist' aria-label='রুটিন' className='mt-6 inline-flex flex-wrap rounded-full border border-line bg-surface p-1'>
          {routines.map((routine, index) => (
            <button
              key={routine.key}
              ref={node => {
                tabRefs.current[index] = node
              }}
              type='button'
              role='tab'
              id={`routine-tab-${routine.key}`}
              aria-controls={`routine-panel-${routine.key}`}
              aria-selected={routine.key === active}
              tabIndex={routine.key === active ? 0 : -1}
              onClick={() => setActive(routine.key)}
              onKeyDown={e => onKeyDown(e, index)}
              className='inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-ink-2 transition hover:text-link aria-selected:bg-accent aria-selected:text-accent-ink'
            >
              <svg className='icon size-4' aria-hidden='true'><use href={`#i-${routine.icon}`} /></svg>
              {routine.name}
            </button>
          ))}
        </div>
      )}

      {routines.map(routine => (
        <div
          key={routine.key}
          role={routines.length > 1 ? 'tabpanel' : undefined}
          id={`routine-panel-${routine.key}`}
          aria-labelledby={routines.length > 1 ? `routine-tab-${routine.key}` : undefined}
          tabIndex={routines.length > 1 ? 0 : undefined}
          hidden={routine.key !== active}
          className='mt-8 focus-visible:outline-offset-8'
        >
          <ol className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {routine.steps.map((step, index) => (
              <li key={`${step.product.id}-${index}`} className='relative flex flex-col rounded-card border border-line bg-surface p-4'>
                <p className='flex items-center gap-2 text-sm font-semibold text-link'>
                  <span className='grid size-7 place-items-center rounded-full bg-accent text-xs text-accent-ink'>{bn(index + 1)}</span>
                  {step.label}
                </p>
                <Link href={step.product.uri} className='group/step mt-3 flex items-center gap-3'>
                  {step.product.image && (
                    <Image src={step.product.image} alt='' width={64} height={80} sizes='64px' className='h-20 w-16 shrink-0 rounded-xl object-cover' />
                  )}
                  <span>
                    <span className='block font-serif text-base leading-snug text-ink transition group-hover/step:text-link'>{step.product.name}</span>
                    <span className='mt-1 block text-sm font-bold text-ink'>{step.product.price}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {routine.canBundle && (
            <div className='mt-6 flex flex-col items-center justify-between gap-4 rounded-card border border-accent/30 bg-surface p-5 sm:flex-row'>
              <p className='text-center sm:text-left'>
                <span className='block text-sm text-ink-2'>পুরো রুটিন একসঙ্গে</span>
                {routine.bundle ? (
                  <span className='flex flex-wrap items-baseline justify-center gap-x-2 sm:justify-start'>
                    <span className='text-2xl font-bold text-sale'>{routine.bundle}</span>
                    <del className='text-muted'>{routine.total}</del>
                    <span className='rounded-full bg-sale/10 px-2.5 py-0.5 text-xs font-semibold text-sale'>{routine.saving} সাশ্রয়</span>
                  </span>
                ) : (
                  <span className='text-2xl font-bold text-ink'>{routine.total}</span>
                )}
              </p>
              <button
                type='button'
                disabled={pending}
                aria-busy={pending || undefined}
                onClick={async () => {
                  setPending(true)
                  await addItems(routine.steps.map(step => ({ productId: step.product.id })), routine.name)
                  setPending(false)
                }}
                className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-ink transition hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70'
              >
                {pending ? (
                  <span aria-hidden='true' className='size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <svg className='icon size-4' aria-hidden='true'><use href='#i-bag' /></svg>
                )}
                {pending ? 'যোগ হচ্ছে…' : 'রুটিন ব্যাগে যোগ করুন'}
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
