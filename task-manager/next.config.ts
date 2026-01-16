import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {},
  allowedDevOrigins: ["*"],
};

export default nextConfig;
