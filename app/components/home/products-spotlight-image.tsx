'use client'

import Image from 'next/image'
import type { ImageData } from '../product/data'
import { useSelectedVariation } from '../product/ProductSelection'

// The spotlight photo: the chosen variation's own image, else the product's

type SpotlightImageProps = {
  image: ImageData | null
  name: string
}

export default function SpotlightImage ({ image, name }: SpotlightImageProps) {
  const { variation } = useSelectedVariation()
  const shown = variation?.image?.sourceUrl ? variation.image : image

  if (!shown?.sourceUrl) {
    return <div aria-hidden='true' className='aspect-square w-full rounded-2xl bg-surface-2' />
  }

  return (
    <Image
      src={shown.sourceUrl}
      alt={shown.altText || name}
      width={800}
      height={800}
      sizes='(min-width: 1024px) 560px, 100vw'
      className='aspect-square w-full rounded-2xl object-cover'
    />
  )
}
