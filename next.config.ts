import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // `next build` prerenders pages in parallel and every page queries
    // WordPress. Local's PHP on Windows drops connections when flooded
    // (nginx then answers 502), so render fewer pages at once and retry a
    // page that still fails. lib/wp.js retries individual queries too.
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 2
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      }
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'woo.local',
        port: '',
        pathname: '/**'
      }
    ],
    qualities: [75],
    // woo.local resolves to 127.0.0.1, which Next blocks by default (SSRF guard).
    // Allow it in dev only; production should point at a public WP host.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production'
  }
}

export default nextConfig
