export async function wpQuery (query, variables = {}) {
  const url = process.env.WP_GRAPHQL_URL

  if (!url) {
    throw new Error('WP_GRAPHQL_URL is not defined')
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

export async function wpMutation (query, variables = {}, headers = {}) {
  const res = await fetch(process.env.WP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}
