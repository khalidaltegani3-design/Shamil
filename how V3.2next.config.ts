[1mdiff --git a/next.config.ts b/next.config.ts[m
[1mindex a9b00e9..82a8abd 100644[m
[1m--- a/next.config.ts[m
[1m+++ b/next.config.ts[m
[36m@@ -1,14 +1,39 @@[m
 [m
 import type {NextConfig} from 'next';[m
 [m
[31m-// Minimal Next.js configuration for Firebase App Hosting[m
[32m+[m[32m// Next.js configuration for Firebase App Hosting[m
 const nextConfig: NextConfig = {[m
[31m-  typescript: {[m
[31m-    ignoreBuildErrors: true,[m
[32m+[m[32m  // Output configuration for App Hosting[m
[32m+[m[32m  output: 'standalone',[m
[32m+[m[41m  [m
[32m+[m[32m  // Build configuration[m
[32m+[m[32m  images: {[m
[32m+[m[32m    unoptimized: true,[m
   },[m
[32m+[m[41m  [m
[32m+[m[32m  // Runtime configuration[m
[32m+[m[32m  poweredByHeader: false,[m
[32m+[m[41m  [m
[32m+[m[32m  // ESLint configuration for build[m
   eslint: {[m
     ignoreDuringBuilds: true,[m
   },[m
[32m+[m[41m  [m
[32m+[m[32m  // TypeScript configuration for build[m
[32m+[m[32m  typescript: {[m
[32m+[m[32m    ignoreBuildErrors: true,[m
[32m+[m[32m  },[m
[32m+[m[41m  [m
[32m+[m[32m  // Webpack configuration for Firebase compatibility[m
[32m+[m[32m  webpack: (config) => {[m
[32m+[m[32m    config.resolve.fallback = {[m
[32m+[m[32m      ...config.resolve.fallback,[m
[32m+[m[32m      fs: false,[m
[32m+[m[32m      net: false,[m
[32m+[m[32m      tls: false,[m
[32m+[m[32m    };[m
[32m+[m[32m    return config;[m
[32m+[m[32m  },[m
 };[m
 [m
 export default nextConfig;[m
