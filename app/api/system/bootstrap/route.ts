import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// One-time setup for the very first SystemUser (DARKSHAM's OWNER account).
// prisma/seed.ts only runs against a local/dev database — the production
// build script is "prisma db push && next build" (no seed step), so this
// route is the safe way to create that first account without needing raw
// production DB access. Self-limiting: no-ops once any SystemUser exists,
// and only reads credentials from server-side env vars (SYSTEM_OWNER_EMAIL /
// SYSTEM_OWNER_PASSWORD) — never from the request — so it can be left in
// place permanently without being an open account-creation endpoint.
export async function POST() {
  const existing = await prisma.systemUser.count();
  if (existing > 0) {
    return NextResponse.json({ ok: false, reason: "already_bootstrapped" }, { status: 409 });
  }

  const email = process.env.SYSTEM_OWNER_EMAIL;
  const password = process.env.SYSTEM_OWNER_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, reason: "SYSTEM_OWNER_EMAIL / SYSTEM_OWNER_PASSWORD not set" },
      { status: 500 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.systemUser.create({
    data: { email: email.toLowerCase(), passwordHash, name: "DARKSHAM", role: "OWNER" }
  });

  return NextResponse.json({ ok: true, email: user.email });
}
