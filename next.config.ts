import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true
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
    qualities: [75]
  }
}

export default nextConfig
