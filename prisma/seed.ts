import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not defined");
  process.exit(1);
}

async function main() {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // 1. Seed Admin
  const adminUsername = process.env.ADMIN_USERNAME || "Nathamgasc";
  const adminPassword = process.env.ADMIN_PASSWORD || "vote@gasc";
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { password: hashedPassword },
    create: {
      username: adminUsername,
      password: hashedPassword,
    },
  });
  console.log(`Admin user '${admin.username}' seeded/updated.`);

  // 2. Seed Settings
  const settingsId = "system-settings";
  const settings = await prisma.settings.upsert({
    where: { id: settingsId },
    update: {},
    create: {
      id: settingsId,
      resultsReleased: false,
    },
  });
  console.log("Default system settings seeded.");

  await prisma.$disconnect();
  await pool.end();
  console.log("Seeding completed successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
