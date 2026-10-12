import { searchSite, searchSuggestions } from '@/lib/search'

// GET /api/search?q=… -> { results: SearchResult[] } for the header palette.
// Up to 8 results; an empty or one-letter query returns category suggestions.
export async function GET (request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  try {
    const results = q.length >= 2 ? await searchSite(q, 5) : await searchSuggestions()
    return Response.json({ results: results.slice(0, 8), suggestions: q.length < 2 })
  } catch {
    return Response.json({ results: [], suggestions: q.length < 2, error: true }, { status: 502 })
  }
}
