import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

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

  const pool = new Pool({
    connectionString,
    /**
     * Expire our own idle connections before the server expires them for us.
     *
     * Postgres hosts drop idle connections on their own schedule (the local dev
     * server does it quickly; Neon and other serverless providers are also
     * aggressive). If the pool still believes such a connection is usable, the
     * next query fails with "Connection terminated unexpectedly" — Prisma P1017.
     * Recycling at 10s keeps us comfortably ahead of that.
     */
    idleTimeoutMillis: 10_000,
    max: 10,
  });

  /**
   * An idle client dropping is a background event with no in-flight query to
   * reject, so Node surfaces it as an unhandled 'error' and takes the process
   * down. pg has already evicted the client by this point — logging is the
   * correct response, and the next query transparently opens a fresh one.
   */
  pool.on("error", (error) => {
    console.error("Postgres pool dropped an idle connection:", error.message);
  });

  // Prisma 7 connects through a driver adapter rather than its own engine.
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
