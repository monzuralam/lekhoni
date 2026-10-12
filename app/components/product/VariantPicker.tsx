'use client'

import type { VariationData } from './data'
import { accepts, type Selection, type VariantAttribute } from './utils'

// Port of initVariants() from design/assets/js/main.js. Options that cannot
// form a variation with the other choices are struck through; picking one
// anyway drops the conflicting choices instead of leaving a dead end.

type VariantPickerProps = {
  attributes: VariantAttribute[]
  variations: VariationData[]
  selection: Selection
  onChange: (selection: Selection) => void
  message?: string | null
}

export default function VariantPicker ({
  attributes,
  variations,
  selection,
  onChange,
  message
}: VariantPickerProps) {
  const available = (name: string, value: string) =>
    variations.some(variation => accepts(variation, { ...selection, [name]: value }))

  const choose = (name: string, value: string) => {
    if (selection[name] === value) {
      // Clicking the chosen option again clears it
      const rest = { ...selection }
      delete rest[name]
      onChange(rest)
      return
    }
    const next: Selection = { ...selection, [name]: value }
    if (!variations.some(variation => accepts(variation, next))) {
      // Keep only the new choice plus the others that still fit with it
      const kept: Selection = { [name]: value }
      Object.entries(selection).forEach(([other, chosen]) => {
        if (other === name) return
        if (variations.some(variation => accepts(variation, { ...kept, [other]: chosen }))) {
          kept[other] = chosen
        }
      })
      onChange(kept)
      return
    }
    onChange(next)
  }

  return (
    <div className='space-y-4'>
      {attributes.map(attribute => {
        const chosen = attribute.options.find(option => option.value === selection[attribute.name])
        return (
          <div key={attribute.name} role='group' aria-label={attribute.label}>
            <p className='mb-2 text-sm font-medium text-ink'>
              {attribute.label}:{' '}
              <span className='font-normal text-muted'>{chosen ? chosen.label : 'বেছে নিন'}</span>
            </p>
            <div className='flex flex-wrap gap-2'>
              {attribute.options.map(option => {
                const pressed = selection[attribute.name] === option.value
                const fits = available(attribute.name, option.value)
                return (
                  <button
                    key={option.value}
                    type='button'
                    aria-pressed={pressed}
                    aria-description={fits ? undefined : 'অন্য অপশনের সঙ্গে পাওয়া যাচ্ছে না'}
                    onClick={() => choose(attribute.name, option.value)}
                    className={`rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-2 transition hover:border-accent hover:text-link aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-link ${fits ? '' : 'text-muted line-through decoration-muted/70'}`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      <p aria-live='polite' hidden={!message} className='text-sm font-medium text-danger'>
        {message}
      </p>
    </div>
  )
}
