import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@feature-flags/shared"],
  turbopack: {
    root: "../..",
  },
};

export default nextConfig;
