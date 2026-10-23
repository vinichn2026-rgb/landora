import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

export function getPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (globalThis.__prisma) {
    return globalThis.__prisma;
  }

  try {
    const pool = globalThis.__pgPool || new Pool({ connectionString });
    if (process.env.NODE_ENV !== "production") {
      globalThis.__pgPool = pool;
    }

    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
      globalThis.__prisma = client;
    }

    return client;
  } catch (err) {
    console.warn("[PRISMA WARNING] Could not instantiate PrismaClient with adapter:", err);
    return null;
  }
}

// Transparent Proxy so callers like `prisma.property.findMany(...)` work seamlessly
// when DATABASE_URL is configured, without crashing at module load time when it is not.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    if (!client) {
      throw new Error(
        `PrismaClient cannot be used because DATABASE_URL is not configured or database driver could not initialize.`
      );
    }
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});

export default prisma;
