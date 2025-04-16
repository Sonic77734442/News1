import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp'], // ✅ теперь Next будет отдавать WebP
  },
  // ✅ Включаем динамическую sitemap и robots
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/robots.txt', destination: '/api/robots' },
    ];
  },
};

export default nextConfig;
