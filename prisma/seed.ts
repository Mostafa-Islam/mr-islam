import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// A standalone script, so it builds its own client rather than importing
// lib/prisma.ts — that file has Next.js-specific hot-reload handling
// that means nothing outside the app.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // 10 is the "cost factor" — bcrypt runs 2^10 internal rounds.
  // Deliberately slow: it makes a stolen database expensive to brute-force.
  // Higher is safer but slower to log in; 10-12 is the normal range.
const seedPassword = process.env.SEED_TEACHER_PASSWORD;
if (!seedPassword) throw new Error("SEED_TEACHER_PASSWORD not set in .env");
const password = await bcrypt.hash(seedPassword, 10);

  // upsert = update if found, create if not. Means you can run this script
  // repeatedly without "phone already exists" errors. A plain create()
  // would fail the second time.
  await prisma.user.upsert({
    where: { phone: "+201224457318" },   // replace with his real number
    update: {},                           // found? change nothing
    create: {
      name: "Islam Moustafa",
      phone: "+201224457318",
      password,
      role: "TEACHER",
      status: "ACTIVE",   // the teacher never waits for approval
    },
  });

  console.log("Teacher account ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);   // non-zero exit tells the terminal this failed
  })
  .finally(() => prisma.$disconnect());