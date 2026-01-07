import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Для Vercel Postgres используем POSTGRES_PRISMA_URL, для других - DATABASE_URL
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL не установлена. Пожалуйста, создайте файл .env с переменной DATABASE_URL.\n' +
    'Пример для SQLite: DATABASE_URL="file:./dev.db"\n' +
    'Пример для PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"'
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
