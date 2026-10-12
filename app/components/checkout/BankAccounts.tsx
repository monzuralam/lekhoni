import type { BankAccount } from './gateways'

// The Direct bank transfer accounts (WooCommerce → Settings → Payments →
// Direct bank transfer). Only the fields filled in there are listed.

const FIELDS: { key: keyof BankAccount; label: string }[] = [
  { key: 'bankName', label: 'ব্যাংক' },
  { key: 'accountName', label: 'অ্যাকাউন্টের নাম' },
  { key: 'accountNumber', label: 'অ্যাকাউন্ট নম্বর' },
  { key: 'sortCode', label: 'রাউটিং নম্বর' },
  { key: 'iban', label: 'IBAN' },
  { key: 'bic', label: 'BIC/SWIFT' }
]

export default function BankAccounts ({ accounts, className = '' }: { accounts: BankAccount[]; className?: string }) {
  if (!accounts.length) return null

  return (
    <div className={`grid gap-2 ${className}`}>
      {accounts.map((account, index) => (
        <dl
          key={index}
          className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-xl border border-line bg-surface-2/60 px-4 py-3 text-sm'
        >
          {FIELDS.filter(field => account[field.key]).map(field => (
            <div key={field.key} className='contents'>
              <dt className='text-muted'>{field.label}</dt>
              <dd className='break-words font-medium text-ink select-all'>{account[field.key]}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  )
}
