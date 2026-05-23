import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@feature-flags/shared"],
  experimental: {
    turbo: {
      root: "../..",
    },
  },
};

export default nextConfig;
