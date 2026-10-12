'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { VariationData } from './data'

// The variation chosen in <VariantPicker /> is shown in several places that
// sit apart in the layout: the gallery image, the price and the stock line.

type SelectionValue = {
  variation: VariationData | null
  setVariation: (variation: VariationData | null) => void
}

const SelectionContext = createContext<SelectionValue>({
  variation: null,
  setVariation: () => {}
})

export function useSelectedVariation () {
  return useContext(SelectionContext)
}

type ProductSelectionProps = {
  children: ReactNode
  // Variation matching the product's default attributes, if any
  initial?: VariationData | null
}

export default function ProductSelection ({ children, initial = null }: ProductSelectionProps) {
  const [variation, setVariation] = useState<VariationData | null>(initial)

  return (
    <SelectionContext.Provider value={{ variation, setVariation }}>
      {children}
    </SelectionContext.Provider>
  )
}
