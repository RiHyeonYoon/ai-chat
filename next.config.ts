import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
