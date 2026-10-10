# Lekhoni

A headless WordPress frontend built with [Next.js](https://nextjs.org) (App Router) and Tailwind CSS. Content is fetched from a WordPress site over [WPGraphQL](https://www.wpgraphql.com/).

## Requirements

- Node.js 20+
- A WordPress site with the **Lekhoni** theme installed and activated (provides the content models and GraphQL fields this frontend expects)
- The **WPGraphQL** plugin installed and activated (required for the GraphQL endpoint)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Create a file named `.env.local` in the project root (same folder as `package.json`):

```bash
WP_GRAPHQL_URL=http://woo.local/graphql
WP_SITE_URL=http://woo.local
```

Adjust the values to match your WordPress site.

| Variable         | Required | Description                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------------- |
| `WP_GRAPHQL_URL` | Yes      | Full URL of the WordPress GraphQL endpoint (`/graphql` by default).         |
| `WP_SITE_URL`    | Yes      | Base URL of the WordPress site.                                             |

> `.env.local` is git-ignored (see `.env*` in `.gitignore`), so it is never committed. Server-side code reads these via `process.env` (see `lib/wp.js`).

### 3. Configure `next.config.ts` for your WordPress host

Next.js only optimizes images served from allow-listed hosts. The `images.remotePatterns` entry must match the hostname your WordPress site serves images from — this project ships with `woo.local`:

```ts
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'woo.local',
      port: '',
      pathname: '/**'
    }
  ],
  qualities: [75]
}
```

If your site is at a different host, change `hostname` (and `protocol`/`port` if needed) to match. Use `protocol: 'https'` for production sites.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result. The home page fetches the latest posts from WordPress, so the WordPress site must be running and reachable.

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

## Project Structure

```
app/                 App Router pages, layout and global styles
  page.tsx           Home page (fetches posts via WPGraphQL)
  layout.tsx         Root layout
  components/        UI components (Header, Footer, HeroSlider, etc.)
lib/
  wp.js              WPGraphQL helpers: wpQuery() and wpMutation()
next.config.ts       Next.js config (images, Turbopack, experimental flags)
```

## Talking to WordPress

Use the helpers in `lib/wp.js` from server components:

```js
import { wpQuery } from '../lib/wp'

const data = await wpQuery(`
  query {
    posts(first: 10) {
      nodes { title slug }
    }
  }
`)
```

- `wpQuery(query, variables)` — reads, cached with `revalidate: 60`.
- `wpMutation(query, variables, headers)` — writes, uncached (`no-store`). Pass auth headers (e.g. a JWT) via the third argument if your endpoint requires them.

## WordPress Notes

- **Theme:** install and activate the **Lekhoni** theme on your WordPress site, then activate the **WPGraphQL** plugin. The frontend expects the content models and GraphQL fields exposed by that theme.
- **Permalinks:** set them to something other than "Plain" or the WPGraphQL endpoint may not resolve.
- **Media:** WordPress must be reachable from the Next.js server so `sourceUrl` images render; add its host to `images.remotePatterns` as shown above.
- **CORS:** not needed for server-side fetches, but required if you later query the GraphQL endpoint from the browser.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/intro)
