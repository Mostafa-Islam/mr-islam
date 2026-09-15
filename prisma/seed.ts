import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Standalone script — builds its own client rather than importing
// lib/prisma.ts, whose hot-reload handling means nothing outside Next.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const seedPassword = process.env.SEED_TEACHER_PASSWORD;
  if (!seedPassword) throw new Error("SEED_TEACHER_PASSWORD not set in .env");

  // 10 is the cost factor — bcrypt runs 2^10 rounds. Deliberately slow,
  // so a stolen database is expensive to brute-force.
  const password = await bcrypt.hash(seedPassword, 10);

  // upsert = update if found, create if not. Lets you re-run this script
  // without "phone already exists" errors.
  await prisma.user.upsert({
    where: { phone: "+201224457318" },
    update: {},
    create: {
      name: "Islam Moustafa",
      phone: "+201224457318",
      password,
      role: "TEACHER",
      status: "ACTIVE",   // the teacher never waits for approval
    },
  });

  // Fixed id so re-running updates this row instead of creating another.
  await prisma.group.upsert({
    where: { id: "seed-group-1" },
    update: {},
    create: {
      id: "seed-group-1",
      name: "Year 11 — Sat 5pm",
      grade: "IG_11",
      schedule: "Saturdays 5:00–6:30 PM",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());