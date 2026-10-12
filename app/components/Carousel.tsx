'use client'

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { bn } from '@/lib/bn'

// Port of initCarousels() from design/assets/js/main.js. The markup inside
// keeps the design's data-carousel-* hooks: track, prev, next, dots, toggle.

type CarouselProps = ComponentPropsWithoutRef<'section'> & {
  autoplay?: number
  loop?: boolean
}

export default function Carousel ({
  autoplay = 0,
  loop = false,
  children,
  ...props
}: CarouselProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const carousel = ref.current
    const track = carousel?.querySelector<HTMLElement>('[data-carousel-track]')
    if (!carousel || !track) return
    const slides = Array.from(track.children) as HTMLElement[]
    if (!slides.length) return

    const prev = carousel.querySelector<HTMLButtonElement>('[data-carousel-prev]')
    const next = carousel.querySelector<HTMLButtonElement>('[data-carousel-next]')
    const dotsBox = carousel.querySelector<HTMLElement>('[data-carousel-dots]')
    const toggle = carousel.querySelector<HTMLButtonElement>('[data-carousel-toggle]')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cleanups: Array<() => void> = []
    const on = (
      target: EventTarget,
      type: string,
      handler: EventListener,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, options)
      cleanups.push(() => target.removeEventListener(type, handler, options))
    }

    let active = 0
    const visible: Record<number, boolean> = {}
    const dots: HTMLButtonElement[] = []

    // Accessibility wiring
    if (!carousel.hasAttribute('role')) carousel.setAttribute('role', 'region')
    carousel.setAttribute('aria-roledescription', 'carousel')
    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group')
      slide.setAttribute('aria-roledescription', 'slide')
      slide.setAttribute('aria-label', `${bn(slides.length)}টির মধ্যে ${bn(i + 1)}`)
    })

    const atStart = () => track.scrollLeft <= 4
    const atEnd = () =>
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 4

    const goTo = (index: number) => {
      const target = slides[Math.min(slides.length - 1, Math.max(0, index))]
      const left =
        target.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft
      track.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' })
    }

    const goNext = () => {
      if (atEnd()) {
        if (loop) goTo(0)
      } else {
        goTo(active + 1)
      }
    }

    const goPrev = () => {
      if (atStart()) {
        if (loop) goTo(slides.length - 1)
      } else {
        goTo(active - 1)
      }
    }

    const syncControls = () => {
      if (!loop) {
        if (prev) prev.disabled = atStart()
        if (next) next.disabled = atEnd()
      }
      dots.forEach((dot, i) => {
        if (i === active) dot.setAttribute('aria-current', 'true')
        else dot.removeAttribute('aria-current')
      })
      slides.forEach((slide, i) => slide.toggleAttribute('data-active', i === active))
    }

    if (dotsBox) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button')
        dot.type = 'button'
        dot.className =
          'h-2.5 w-2.5 rounded-full bg-ink/25 transition-all duration-300 hover:bg-ink/50 aria-[current=true]:w-7 aria-[current=true]:bg-accent'
        dot.setAttribute('aria-label', `স্লাইড ${bn(i + 1)} দেখুন`)
        on(dot, 'click', () => goTo(i))
        dotsBox.appendChild(dot)
        dots.push(dot)
      })
      cleanups.push(() => dots.forEach(dot => dot.remove()))
    }

    if (prev) on(prev, 'click', goPrev)
    if (next) on(next, 'click', goNext)

    // Track the active slide (first slide that is mostly visible)
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          visible[slides.indexOf(entry.target as HTMLElement)] = entry.isIntersecting
        })
        const first = slides.findIndex((_, i) => visible[i])
        if (first !== -1) active = first
        syncControls()
      },
      { root: track, threshold: 0.6 }
    )
    slides.forEach(slide => observer.observe(slide))
    cleanups.push(() => observer.disconnect())

    let scrollTick = false
    on(
      track,
      'scroll',
      () => {
        if (scrollTick) return
        scrollTick = true
        requestAnimationFrame(() => {
          syncControls()
          scrollTick = false
        })
      },
      { passive: true }
    )

    on(carousel, 'keydown', event => {
      const e = event as KeyboardEvent
      const target = e.target as HTMLElement
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return
      if (target.closest('[data-carousel]') !== carousel) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    })

    // Autoplay: pauses on hover, on focus inside, when the tab is hidden,
    // and never starts when the user prefers reduced motion.
    if (autoplay && !reducedMotion.matches) {
      let timer: ReturnType<typeof setInterval> | null = null
      let userPaused = false
      let hovering = false
      let focused = false

      const refresh = () => {
        const shouldRun = !userPaused && !hovering && !focused && !document.hidden
        if (shouldRun && !timer) timer = setInterval(goNext, autoplay)
        if (!shouldRun && timer) {
          clearInterval(timer)
          timer = null
        }
        carousel.toggleAttribute('data-paused', userPaused)
        toggle?.setAttribute(
          'aria-label',
          userPaused ? 'স্লাইড চালু করুন' : 'স্লাইড থামান'
        )
      }

      on(carousel, 'mouseenter', () => {
        hovering = true
        refresh()
      })
      on(carousel, 'mouseleave', () => {
        hovering = false
        refresh()
      })
      on(carousel, 'focusin', () => {
        focused = true
        refresh()
      })
      on(carousel, 'focusout', event => {
        if (!carousel.contains((event as FocusEvent).relatedTarget as Node)) {
          focused = false
          refresh()
        }
      })
      on(document, 'visibilitychange', refresh)
      if (toggle) {
        on(toggle, 'click', () => {
          userPaused = !userPaused
          refresh()
        })
      }
      refresh()
      cleanups.push(() => {
        if (timer) clearInterval(timer)
      })
    } else if (toggle) {
      toggle.hidden = true
    }

    syncControls()

    return () => cleanups.forEach(cleanup => cleanup())
  }, [autoplay, loop])

  return (
    <section
      ref={ref}
      data-carousel
      data-autoplay={autoplay || undefined}
      data-loop={loop || undefined}
      {...props}
    >
      {children}
    </section>
  )
}
