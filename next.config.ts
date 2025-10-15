
import type {NextConfig} from 'next';

// Next.js configuration for Firebase App Hosting
const nextConfig: NextConfig = {
  // Output configuration for App Hosting
  output: 'standalone',
  
  // Build configuration
  images: {
    unoptimized: true,
  },
  
  // Runtime configuration
  poweredByHeader: false,
  
  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for Firebase compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
