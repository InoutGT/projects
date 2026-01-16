import { handlers } from "@/auth";

// Force Node.js runtime to avoid Edge Runtime issues with Prisma on Vercel
export const runtime = "nodejs";

export const { GET, POST } = handlers;
