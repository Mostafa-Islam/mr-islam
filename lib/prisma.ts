import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";


// A pool holds a set of open TCP connections and hands them out per query.
// Opening a fresh connection each time would add ~50ms per request, and
// Neon caps concurrent connections — you'd hit the limit under load.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Prisma 7's bridge: instead of its own Rust engine, Prisma issues queries
// through node-postgres. This is what makes it work on serverless.
const adapter = new PrismaPg(pool);

// Next.js hot-reloads this module on every file save in dev. Without this
// cache you'd create a new PrismaClient (and a new pool) on each reload
// until Neon refuses further connections. Production loads once, so it's skipped.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;