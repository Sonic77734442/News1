import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.sanity.io'],
  },
  // 🔇 Перенаправления для sitemap отключены — используем static файл
  // async rewrites() {
  //   return [
  //     { source: '/sitemap.xml', destination: '/api/sitemap' },
  //     { source: '/robots.txt', destination: '/api/robots' },
  //   ];
  // },
};

export default nextConfig;
