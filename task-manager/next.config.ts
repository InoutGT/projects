import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для работы с Prisma на Vercel
  serverExternalPackages: ["@prisma/client"],
  // Disable experimental features that might trigger middleware
  experimental: {},
};

export default nextConfig;
