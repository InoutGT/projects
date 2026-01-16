import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.replit.dev", "*.picard.replit.dev", "localhost:5000"]
    }
  },
  // @ts-ignore
  allowedDevOrigins: ["62d732b1-398c-4264-98e2-0107d1c8d66a-00-ldekcjvvhr7c.picard.replit.dev", "localhost:5000"],
};

export default nextConfig;
