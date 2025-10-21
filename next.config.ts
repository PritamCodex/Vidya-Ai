import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* your existing config options */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable React strict mode
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack hot module replacement
      config.watchOptions = {
        ignored: ["**/*"], // Ignore all file changes (handled by nodemon)
      };
    }
    return config;
  },
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },

  // ✅ Fix for Next.js dev API origin warning
  experimental: {
    allowedDevOrigins: ["http://localhost:3000"],
  },
};

export default nextConfig;
