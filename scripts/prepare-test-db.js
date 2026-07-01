import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://artos:artos@localhost:5432/artos_test?schema=public";

const ADMIN_DATABASE_URL =
  "postgresql://artos:artos@localhost:5432/postgres?schema=public";

async function ensureTestDatabaseExists() {
  const admin = new PrismaClient({
    datasources: { db: { url: ADMIN_DATABASE_URL } },
  });

  try {
    const rows = await admin.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM pg_database WHERE datname = 'artos_test'
      ) AS "exists"
    `;

    if (!rows[0]?.exists) {
      await admin.$executeRawUnsafe("CREATE DATABASE artos_test");
      console.log("Created database artos_test.");
    }
  } finally {
    await admin.$disconnect();
  }
}

function applyTestMigrations() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
    },
  });
}

async function main() {
  await ensureTestDatabaseExists();
  applyTestMigrations();
  console.log("Test database is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
