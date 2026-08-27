// One-time script: create the "DARKSHAM" SUPER_ADMIN account. Wired into
// package.json's build script for a single production deploy, then removed
// — same pattern as the earlier emergency admin-password reset.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERNAME = "DARKSHAM";
const PASSWORD = "Sakkab@Reset2026!";

async function main() {
  const existing = await prisma.admin.findUnique({ where: { username: USERNAME } });
  if (existing) {
    console.log(`Admin "${USERNAME}" already exists — skipped.`);
    return;
  }
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await prisma.admin.create({
    data: { username: USERNAME, passwordHash, role: "SUPER_ADMIN" }
  });
  console.log(`Created SUPER_ADMIN "${USERNAME}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
