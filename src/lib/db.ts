import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let prisma: PrismaClient;
let pool: pg.Pool;

const connectionString = process.env.DATABASE_URL || '';

function createPool() {
  if (!connectionString) {
    console.warn('DATABASE_URL environment variable is not defined.');
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const needsSsl = isProduction || connectionString.includes('sslmode=require') || connectionString.includes('supabase') || connectionString.includes('neon') || connectionString.includes('vercel-storage');

  return new pg.Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
  });
}

if (process.env.NODE_ENV === 'production') {
  pool = createPool();
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = createPool();
  }
  pool = globalForPrisma.pool;
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma, pool };
