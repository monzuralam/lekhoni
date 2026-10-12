'use client'

// Port of initQuantity() from design/assets/js/main.js (controlled version)

type QuantityStepperProps = {
  value: number
  max: number
  onChange: (value: number) => void
  id?: string
}

export default function QuantityStepper ({ value, max, onChange, id = 'product-qty' }: QuantityStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(1, Math.round(next) || 1))

  return (
    <div className='inline-flex items-center rounded-full border border-line bg-surface'>
      <button
        type='button'
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        aria-label='পরিমাণ কমান'
        className='grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-minus' />
        </svg>
      </button>
      <label htmlFor={id} className='sr-only'>
        পরিমাণ
      </label>
      <input
        id={id}
        type='number'
        value={value}
        min={1}
        max={max}
        inputMode='numeric'
        onChange={e => onChange(clamp(Number(e.target.value)))}
        className='w-10 bg-transparent text-center text-sm font-semibold text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none'
      />
      <button
        type='button'
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label='পরিমাণ বাড়ান'
        className='grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-link disabled:cursor-not-allowed disabled:opacity-40'
      >
        <svg className='icon size-4' aria-hidden='true'>
          <use href='#i-plus' />
        </svg>
      </button>
    </div>
  )
}
