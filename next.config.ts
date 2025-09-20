
import type {NextConfig} from 'next';
require('dotenv').config();

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Other experimental features can go here in the future
  },
  // This is to allow the Next.js dev server to accept requests from the
  // Studio UI, which is served on a different origin.
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
    'https://*.firebase.app',
    'http://192.168.18.70',
    'http://localhost',
    '192.168.18.70:3000',
    'localhost:3000',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // إعدادات webpack للتعامل مع التشفير
  webpack: (config: any) => {
    config.output = config.output || {};
    config.output.charset = true;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'commondatastorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Allow blob URLs for image previews
    domains: ['blob'],
  },
  reactStrictMode: false,
};

export default nextConfig;
