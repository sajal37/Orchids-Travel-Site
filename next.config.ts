import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(
  __dirname,
  "src/visual-edits/component-tagger-loader.js"
);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER],
      },
    },
  },
  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable browser source map generation for production
  productionBrowserSourceMaps: true,
  // Optimize font loading
  optimizeFonts: true,
  // Enable server actions and mutations
  serverActions: {
    bodySizeLimit: '2mb',
  },
  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size by excluding unnecessary modules
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;