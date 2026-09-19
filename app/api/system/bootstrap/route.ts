import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Setup/reset for DARKSHAM's OWNER account. prisma/seed.ts only runs
// against a local/dev database — the production build script is "prisma db
// push && next build" (no seed step), so this route is the safe way to
// create (or reset the password of) that one account without needing raw
// production DB access. Upserts on the email from SYSTEM_OWNER_EMAIL only —
// credentials are read from server-side env vars, never from the request —
// so it can be left in place permanently without being an open
// account-creation endpoint: the only thing it can ever do is sync the one
// OWNER row to whatever SYSTEM_OWNER_EMAIL/PASSWORD currently hold.
// Note: a literal "$" in SYSTEM_OWNER_PASSWORD gets silently truncated
// somewhere in Vercel's own env-var storage (confirmed empirically, not a
// shell-quoting issue on our end) — avoid that character in this value.
export async function POST() {
  const email = process.env.SYSTEM_OWNER_EMAIL;
  const password = process.env.SYSTEM_OWNER_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, reason: "SYSTEM_OWNER_EMAIL / SYSTEM_OWNER_PASSWORD not set" },
      { status: 500 }
    );
  }

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.systemUser.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash, role: "OWNER" },
    create: { email: normalizedEmail, passwordHash, name: "DARKSHAM", role: "OWNER" }
  });

  return NextResponse.json({ ok: true, email: user.email });
}
