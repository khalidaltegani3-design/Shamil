
import type {NextConfig} from 'next';

// Simplified Next.js configuration for Firebase App Hosting
const nextConfig: NextConfig = {
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Build configuration for App Hosting
  images: {
    unoptimized: true,
  },
  
  // Runtime configuration
  poweredByHeader: false,
  
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
