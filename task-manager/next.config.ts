import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для работы с Prisma на Vercel
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
