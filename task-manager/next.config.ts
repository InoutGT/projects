import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.picard.replit.dev", "localhost:5000"]
    }
  },
  // @ts-ignore - Next.js 15+ property
  allowedDevOrigins: ["*"],
};

export default nextConfig;
