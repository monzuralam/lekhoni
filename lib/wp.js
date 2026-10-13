// Busy WordPress servers sometimes answer with an HTML error page (nginx 502
// "no live upstreams" when PHP workers are saturated, e.g. during
// `next build`) or drop the connection. Queries are read-only, so those
// failures are retried with a short backoff; mutations are never retried.
const RETRY_DELAYS = [300, 1000, 2500, 5000]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Parse a GraphQL response, or describe why it isn't one
async function readJson (res) {
  const text = await res.text()
  try {
    return { json: JSON.parse(text) }
  } catch {
    const title = /<title>([^<]*)<\/title>/i.exec(text)?.[1]?.trim()
    return { error: `WordPress returned ${res.status}${title ? ` (${title})` : ''} instead of JSON` }
  }
}

// `tags` are added to the fetch cache entry, so revalidateTag (see
// app/api/revalidate) clears it together with the 'use cache' entries
export async function wpQuery (query, variables = {}, { tags } = {}) {
  const url = process.env.WP_GRAPHQL_URL

  if (!url) {
    throw new Error('WP_GRAPHQL_URL is not defined')
  }

  let lastError
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS[attempt - 1])
    let res
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60, ...(tags ? { tags } : {}) }
      })
    } catch (error) {
      lastError = error // connection refused or reset
      continue
    }
    const { json, error } = await readJson(res)
    if (!json) {
      lastError = new Error(error)
      // Retry server errors; a 4xx HTML page won't get better
      if (res.status >= 500 || res.status === 429) continue
      break
    }
    if (json.errors) throw new Error(json.errors[0].message)
    return json.data
  }
  throw lastError
}

export async function wpMutation (query, variables = {}, headers = {}) {
  const res = await fetch(process.env.WP_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  })
  const { json, error } = await readJson(res)
  if (!json) throw new Error(error)
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}
