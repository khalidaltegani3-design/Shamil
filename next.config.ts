import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
    ],
    // Allow blob URLs for image previews
    domains: ['blob'],
  },
  devIndicators: {
    buildActivity: false
  },
  experimental: {
    allowedDevOrigins: [
        "*.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
