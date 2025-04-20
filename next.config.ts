import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp'],
  },
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/robots.txt', destination: '/api/robots' },
    ];
  },
};

// 👇 Добавляем функцию headers отдельно, вне nextConfig
export async function headers() {
  return [
    {
      source: '/widget/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'ALLOWALL',
        },
      ],
    },
  ];
}

export default nextConfig;
