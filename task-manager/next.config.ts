import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.picard.replit.dev", "localhost:5000"]
    }
  },
};

export default nextConfig;
