import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."ProductLine"'::regtype ORDER BY enumsortorder;`
  );
  console.log("ProductLine BEFORE:", before.map((r) => r.enumlabel));

  await prisma.$executeRawUnsafe(`ALTER TYPE "ProductLine" ADD VALUE IF NOT EXISTS 'ALUMINUM_ECOBOND';`);

  const after = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
    `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public."ProductLine"'::regtype ORDER BY enumsortorder;`
  );
  console.log("ProductLine AFTER:", after.map((r) => r.enumlabel));
}

main()
  .catch((e) => {
    console.error("FIX_SCRIPT_ERROR:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
