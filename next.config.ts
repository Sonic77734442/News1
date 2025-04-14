import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.sanity.io'], // ✅ разрешаем картинки с Sanity CDN
  },
}

export default nextConfig
