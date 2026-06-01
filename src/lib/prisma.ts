import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let db: PrismaClient;

if (globalForPrisma.prisma) {
  db = globalForPrisma.prisma;
} else {
  // Prisma 7 requires the PG adapter when using the client engine.
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  db = new PrismaClient({ 
    adapter,
    log: ["query"] 
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
  }
}

export { db };
