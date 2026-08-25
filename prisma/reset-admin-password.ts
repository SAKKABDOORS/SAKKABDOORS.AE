import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = "Sakkab@Reset2026!";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.update({ where: { username: "admin" }, data: { passwordHash } });
  console.log("Admin password reset.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
