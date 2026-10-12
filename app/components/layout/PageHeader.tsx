import type { ReactNode } from 'react'
import Breadcrumbs, { type Crumb } from './Breadcrumbs'

type PageHeaderProps = {
  title: string
  breadcrumbs: Crumb[] // excluding Home, ending with the current page
  description?: ReactNode
}

export default function PageHeader ({ title, breadcrumbs, description }: PageHeaderProps) {
  return (
    <header className='border-b border-line bg-surface-2/60'>
      <div className='mx-auto w-full max-w-site px-4 sm:px-6 py-10 text-center sm:py-14'>
        <div className='flex justify-center'>
          <Breadcrumbs items={breadcrumbs} />
        </div>
        <h1 className='mt-3 text-3xl text-ink sm:text-[2.5rem]'>{title}</h1>
        {description && (
          <div className='mx-auto mt-3 max-w-2xl text-lg text-ink-2'>{description}</div>
        )}
      </div>
    </header>
  )
}
