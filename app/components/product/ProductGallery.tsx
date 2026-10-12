'use client'

import { useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { bn } from '@/lib/bn'
import { useLayer } from '../useLayer'
import type { ImageData } from './data'
import { useSelectedVariation } from './ProductSelection'

// Port of initProductGallery() + openLightbox() from design/assets/js/main.js:
// thumbnails switch the main image, the main image opens a lightbox.

type ProductGalleryProps = {
  images: ImageData[]
  name: string
  // "−২২% ছাড়" style badge text, or null
  badge?: string | null
}

export default function ProductGallery ({ images, name, badge }: ProductGalleryProps) {
  const { variation } = useSelectedVariation()
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  // Show the chosen variation's own photo (one that is not in the gallery)
  const [showVariation, setShowVariation] = useState(false)
  const [seenVariation, setSeenVariation] = useState(variation)

  const variationSrc = variation?.image?.sourceUrl
  const galleryIndex = variationSrc
    ? images.findIndex(image => image.sourceUrl === variationSrc)
    : -1
  if (seenVariation !== variation) {
    // New variation: jump to its photo, adjusting state during render
    setSeenVariation(variation)
    if (galleryIndex !== -1) setCurrent(galleryIndex)
    setShowVariation(Boolean(variationSrc) && galleryIndex === -1)
  }

  const variationImage = showVariation && variation?.image ? variation.image : null
  const items = variationImage ? [variationImage, ...images] : images
  const active = variationImage ? 0 : current
  const main = items[active]
  const altFor = (image: ImageData, index: number) =>
    image.altText || (index === 0 ? name : `${name}, ছবি ${bn(index + 1)}`)

  return (
    <div className='self-start lg:sticky lg:top-32'>
      <div className='relative overflow-hidden rounded-card border border-line bg-surface-2'>
        {main ? (
          <button
            type='button'
            onClick={() => setLightbox(active)}
            aria-label='ছবি বড় করে দেখুন'
            className='block w-full cursor-zoom-in'
          >
            <Image
              key={main.sourceUrl}
              src={main.sourceUrl}
              alt={altFor(main, active)}
              width={800}
              height={800}
              priority
              sizes='(min-width: 1024px) 560px, 100vw'
              className='aspect-square w-full object-cover'
            />
          </button>
        ) : (
          <div className='aspect-square w-full' />
        )}
        {badge && (
          <span className='pointer-events-none absolute left-4 top-4 rounded-full bg-sale px-3 py-1 text-xs font-semibold text-white'>
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul aria-label='পণ্যের ছবি' className='mt-3 grid grid-cols-4 gap-3'>
          {images.map((image, index) => {
            const isCurrent = !variationImage && index === current
            return (
              <li key={image.sourceUrl}>
                <button
                  type='button'
                  onClick={() => {
                    setCurrent(index)
                    setShowVariation(false)
                  }}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`ছবি ${bn(index + 1)}: ${image.altText || name}`}
                  className='block w-full overflow-hidden rounded-xl border-2 border-transparent opacity-70 transition hover:opacity-100 aria-[current=true]:border-accent aria-[current=true]:opacity-100'
                >
                  <Image
                    src={image.sourceUrl}
                    alt=''
                    width={800}
                    height={800}
                    sizes='(min-width: 1024px) 130px, 25vw'
                    className='aspect-square w-full object-cover'
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {lightbox !== null &&
        createPortal(
          <Lightbox
            items={items.map((image, index) => ({ src: image.sourceUrl, alt: altFor(image, index) }))}
            start={lightbox}
            onClose={() => setLightbox(null)}
          />,
          document.body
        )}
    </div>
  )
}

type LightboxProps = {
  items: { src: string; alt: string }[]
  start: number
  onClose: () => void
}

function Lightbox ({ items, start, onClose }: LightboxProps) {
  const { overlayProps, initialFocusRef } = useLayer(onClose)
  const [index, setIndex] = useState(start)
  const single = items.length < 2
  const show = (next: number) => setIndex((next + items.length) % items.length)
  const item = items[index]

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') show(index - 1)
    if (e.key === 'ArrowRight') show(index + 1)
    overlayProps.onKeyDown(e)
  }

  return (
    <div
      {...overlayProps}
      onKeyDown={onKeyDown}
      className='fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4 print:hidden'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-label='ছবি দেখুন'
        className='relative flex max-h-full w-full max-w-4xl flex-col items-center gap-3'
      >
        {/* Natural size inside the viewport, so a plain img fits better than next/image here */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          className='max-h-[76vh] w-auto max-w-full rounded-xl bg-white object-contain animate-pop'
        />
        {!single && (
          <div className='flex items-center gap-3'>
            <button
              type='button'
              onClick={() => show(index - 1)}
              aria-label='আগের ছবি'
              className='grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25'
            >
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-arrow-left' />
              </svg>
            </button>
            <span aria-live='polite' className='min-w-16 text-center text-sm text-white/80'>
              {bn(index + 1)} / {bn(items.length)}
            </span>
            <button
              type='button'
              onClick={() => show(index + 1)}
              aria-label='পরের ছবি'
              className='grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25'
            >
              <svg className='icon size-5' aria-hidden='true'>
                <use href='#i-arrow-right' />
              </svg>
            </button>
          </div>
        )}
      </div>
      <button
        ref={initialFocusRef}
        type='button'
        onClick={onClose}
        aria-label='বন্ধ করুন'
        className='absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25'
      >
        <svg className='icon size-5' aria-hidden='true'>
          <use href='#i-close' />
        </svg>
      </button>
    </div>
  )
}
