import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для работы с Prisma на Vercel
  serverExternalPackages: ["@prisma/client"],
  // Отключаем проверку middleware для совместимости
  experimental: {
    proxyTimeout: 30,
  },
};

export default nextConfig;
