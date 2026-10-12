'use client'

import { useEffect, useRef } from 'react'

// COMPONENT: ReadingProgress. Port of initReadingProgress() in
// design/assets/js/main.js: a bar at the top that fills while `target` is read.

export default function ReadingProgress ({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const node = document.querySelector(target)
      if (!node || !bar.current) return
      const rect = node.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.6
      const done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)))
      bar.current.style.setProperty('--progress', done.toFixed(4))
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    update()
    return () => {
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      cancelAnimationFrame(frame)
    }
  }, [target])

  return (
    <div aria-hidden='true' className='fixed inset-x-0 top-0 z-50 h-1 print:hidden'>
      <div ref={bar} className='h-full origin-left scale-x-(--progress) bg-accent [--progress:0]' />
    </div>
  )
}
