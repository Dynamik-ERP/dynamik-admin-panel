import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /\/api\/(auth|login|refresh|logout)/,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /\/api\/(orders|warehouse|production|inventory|notifications|audit)/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'admin-erp-live-data',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        },
      },
      {
        urlPattern: /\/api\/(clients|designers|staff|registration-codes)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'admin-erp-reference-data',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 30 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|woff2?)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'admin-static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps:
    process.env.SOURCE_MAPS === 'true' && typeof Bun === 'undefined',
  compress: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
}

export default withPWA(nextConfig)
