
import type {NextConfig} from 'next';

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
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
