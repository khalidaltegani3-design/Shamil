
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Updated to use serverExternalPackages instead of experimental
  serverExternalPackages: ['firebase-admin'],
  
  // Simplified webpack config
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'firebase-admin': false,
    };
    return config;
  },
  
  // Simplified images config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
  
  reactStrictMode: false,
};

export default nextConfig;
