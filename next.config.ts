import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@supabase/ssr'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

export default nextConfig;

