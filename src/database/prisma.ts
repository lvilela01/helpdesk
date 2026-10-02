import { Pool } from "pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "@/env";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "production" ? [] : ["query"],
});
