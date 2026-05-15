import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'
import path from 'path'

const withSerwist = withSerwistInit({
  swSrc: 'src/frontend/app/sw.ts',
  swDest: 'src/frontend/public/sw.js',
  disable: true,
})

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '.'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default withSerwist(nextConfig)
