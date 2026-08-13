import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client.
 *
 * Next.js hot-reloads modules in development, which would otherwise construct a
 * new client (and a new connection pool) on every reload until Postgres runs out
 * of connections. Caching it on globalThis keeps reloads reusing one instance.
 * In production the module is only evaluated once, so the cache isn't needed.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — see .env.example.");
  }
  // Prisma 7 connects through a driver adapter rather than its own engine.
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
