import { cacheLife, cacheTag } from 'next/cache'
import { plainText } from '@/lib/products'

export type BankAccount = {
  accountName: string | null
  bankName: string | null
  accountNumber: string | null
  sortCode: string | null
  iban: string | null
  bic: string | null
}

export type Gateway = {
  id: string
  title: string
  description: string
  // Direct bank transfer only: the accounts from its WooCommerce settings
  accounts?: BankAccount[]
}

// Bangla copy for the common WooCommerce gateways, used while the title or
// description is still WooCommerce's default English text. Text edited in
// WooCommerce → Settings → Payments is shown as written.
const BANGLA: Record<string, Omit<Gateway, 'id'> & { defaultTitle: string; defaultDescription: string }> = {
  cod: {
    title: 'ক্যাশ অন ডেলিভারি',
    description: 'পণ্য হাতে পেয়ে ডেলিভারি কর্মীকে নগদ টাকা দিন। বাড়তি কোনো চার্জ নেই।',
    defaultTitle: 'Cash on delivery',
    defaultDescription: 'Pay with cash upon delivery.'
  },
  bacs: {
    title: 'সরাসরি ব্যাংক ট্রান্সফার',
    description: 'আমাদের ব্যাংক অ্যাকাউন্টে সরাসরি টাকা পাঠান। রেফারেন্স হিসেবে অর্ডার নম্বর ব্যবহার করুন।',
    defaultTitle: 'Direct bank transfer',
    defaultDescription:
      'Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.'
  },
  cheque: {
    title: 'চেক পেমেন্ট',
    description: 'আমাদের দোকানের ঠিকানায় চেক পাঠান।',
    defaultTitle: 'Check payments',
    defaultDescription: 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.'
  }
}

const same = (a: string, b: string) => a.replace(/\s+/g, ' ').trim().toLowerCase() === b.toLowerCase()

export function gatewayTitle (id: string, fallback: string | null) {
  const bangla = BANGLA[id]
  if (bangla && (!fallback || same(fallback, bangla.defaultTitle))) return bangla.title
  return fallback || id
}

function gatewayDescription (id: string, text: string) {
  const bangla = BANGLA[id]
  return bangla && (!text || same(text, bangla.defaultDescription)) ? bangla.description : text
}

// Direct bank transfer details for the order-received page: the
// "Instructions" text and the accounts. Null while the method is disabled.
export async function getBankTransfer (): Promise<{ instructions: string | null; accounts: BankAccount[] } | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('payment-gateways')

  const url = process.env.WP_GRAPHQL_URL
  if (!url) throw new Error('WP_GRAPHQL_URL is not defined')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '{ bankTransfer { instructions accounts { accountName bankName accountNumber sortCode iban bic } } }'
    })
  })
  const json = await res.json().catch(() => null)
  const bank = json?.data?.bankTransfer
  return bank ? { instructions: bank.instructions ?? null, accounts: bank.accounts ?? [] } : null
}

// Enabled payment gateways (WooGraphQL paymentGateways) and the bank transfer
// accounts (theme field `bankTransfer`, inc/payments.php). Public store data,
// so it is cached for a few minutes and becomes part of the static shell.
export async function getPaymentGateways (): Promise<Gateway[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('payment-gateways')

  const url = process.env.WP_GRAPHQL_URL
  if (!url) throw new Error('WP_GRAPHQL_URL is not defined')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{
        paymentGateways { nodes { id title description } }
        bankTransfer { accounts { accountName bankName accountNumber sortCode iban bic } }
      }`
    })
  })
  const json = await res.json().catch(() => null)
  const nodes: { id: string; title: string | null; description: string | null }[] =
    json?.data?.paymentGateways?.nodes ?? []
  const accounts: BankAccount[] = json?.data?.bankTransfer?.accounts ?? []

  return nodes.map(node => ({
    id: node.id,
    title: gatewayTitle(node.id, plainText(node.title)),
    description: gatewayDescription(node.id, plainText(node.description)),
    ...(node.id === 'bacs' ? { accounts } : {})
  }))
}
