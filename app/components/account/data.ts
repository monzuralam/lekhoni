import { cache } from 'react'
import { redirect } from 'next/navigation'
import { authQuery, getAuthToken } from '@/lib/auth'
import { ADDRESS_GRAPHQL, type CustomerAddress } from './address'
import { ORDER_GRAPHQL, toOrderRow, type RawOrderRow } from './orders'

// Customer data for the account pages. Everything reads the auth cookies, so
// callers must sit inside <Suspense> (cacheComponents).

export const ORDERS_PER_PAGE = 10

export type Customer = {
  databaseId: number
  firstName: string | null
  lastName: string | null
  displayName: string | null
  email: string | null
  username: string | null
  orderCount: number | null
  billing: CustomerAddress | null
  shipping: CustomerAddress | null
}

const CUSTOMER_QUERY = `{
  customer {
    databaseId
    firstName
    lastName
    displayName
    email
    username
    orderCount
    billing { ${ADDRESS_GRAPHQL} email }
    shipping { ${ADDRESS_GRAPHQL} }
  }
}`

// One customer lookup per request, shared by the layout and the page.
// Null for guests or when the session is no longer valid.
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = await getAuthToken()
  if (!token) return null
  const json = await authQuery<{ customer: Customer | null }>(CUSTOMER_QUERY)
  return json.data?.customer ?? null
})

export async function requireCustomer (path: string) {
  const customer = await getCustomer()
  if (!customer) redirect(`/login?next=${encodeURIComponent(path)}`)
  return customer
}

// Pending, processing and on-hold orders (the dashboard's "ongoing" tile)
export async function getActiveOrderCount () {
  const json = await authQuery<{ customer: { orders: { nodes: { databaseId: number }[] } } | null }>(
    `{
      customer {
        orders(first: 100, where: { statuses: [PENDING, PROCESSING, ON_HOLD] }) {
          nodes { databaseId }
        }
      }
    }`
  )
  return json.data?.customer?.orders.nodes.length ?? 0
}

export type OrdersPage = Awaited<ReturnType<typeof getOrders>>

// Newest first, ORDERS_PER_PAGE at a time. `persist` only in Route Handlers.
export async function getOrders (after: string | null = null, { persist = false } = {}) {
  const json = await authQuery<{
    customer: {
      orders: {
        nodes: RawOrderRow[]
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    } | null
  }>(
    `query Orders($first: Int, $after: String) {
      customer {
        orders(first: $first, after: $after) {
          nodes { ${ORDER_GRAPHQL} }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`,
    { first: ORDERS_PER_PAGE, after },
    { persist }
  )
  const orders = json.data?.customer?.orders
  if (!orders) return null
  return {
    orders: orders.nodes.map(toOrderRow),
    hasNextPage: orders.pageInfo.hasNextPage,
    endCursor: orders.pageInfo.endCursor
  }
}

export type OrderDetail = {
  databaseId: number
  orderNumber: string | null
  date: string | null
  status: string | null
  subtotal: string | null
  discountTotal: string | null
  rawDiscount: string | null
  shippingTotal: string | null
  rawShipping: string | null
  total: string | null
  paymentMethod: string | null
  paymentMethodTitle: string | null
  customerNote: string | null
  billing: CustomerAddress | null
  shipping: CustomerAddress | null
  // Cart fees kept on the order, e.g. the routine bundle discount (total "-282.00")
  feeLines: { nodes: { name: string | null; total: string | null }[] } | null
  lineItems: {
    nodes: {
      quantity: number | null
      subtotal: string | null
      product: { node: { name: string; uri: string | null; image: { sourceUrl: string } | null } | null } | null
      variation: { node: { name: string } | null } | null
    }[]
  } | null
}

// Only the signed-in customer's own orders are reachable: the lookup goes
// through `customer.orders`, never the global `order` field.
export async function getOrder (id: number) {
  const json = await authQuery<{ customer: { orders: { nodes: OrderDetail[] } } | null }>(
    `query Order($ids: [Int]) {
      customer {
        orders(first: 1, where: { include: $ids }) {
          nodes {
            databaseId
            orderNumber
            date
            status
            subtotal
            discountTotal
            rawDiscount: discountTotal(format: RAW)
            shippingTotal
            rawShipping: shippingTotal(format: RAW)
            total
            paymentMethod
            paymentMethodTitle
            customerNote
            billing { ${ADDRESS_GRAPHQL} email }
            shipping { ${ADDRESS_GRAPHQL} }
            feeLines { nodes { name total } }
            lineItems {
              nodes {
                quantity
                subtotal
                product { node { name uri image { sourceUrl } } }
                variation { node { name } }
              }
            }
          }
        }
      }
    }`,
    { ids: [id] }
  )
  return json.data?.customer?.orders.nodes.find(order => order.databaseId === id) ?? null
}
