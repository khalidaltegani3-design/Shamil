
import type {NextConfig} from 'next';

// Minimal Next.js configuration for Firebase App Hosting
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
