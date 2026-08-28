// One-time script: reset the DARKSHAM admin account's password after the
// user lost it. Wired into package.json's build script for a single
// deploy, then removed — never left in the codebase long-term.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const NEW_PASSWORD = "Sakkab@Darksham99!";

async function main() {
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
  const admin = await prisma.admin.update({
    where: { username: "DARKSHAM" },
    data: { passwordHash }
  });
  console.log(`Password reset for ${admin.username}. New password: ${NEW_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
