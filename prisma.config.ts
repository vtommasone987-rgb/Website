import process from "node:process";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer auto-loads .env, so do it explicitly. Node's built-in
// loader avoids pulling in dotenv just for this. Both files are gitignored;
// .env holds the database URLs and .env.local holds the admin credentials.
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Missing file is fine — CI and production supply real env vars directly.
  }
}

// Datasource URLs live here rather than in schema.prisma (Prisma 7 reads them
// from the config file).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
  migrations: {
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
});
