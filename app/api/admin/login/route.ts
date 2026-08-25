import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import { homeForRole, isAdminRole } from "@/lib/adminRoles";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { username: parsed.data.username }
  });

  if (!admin) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const role = isAdminRole(admin.role) ? admin.role : "EMPLOYEE";
  await createAdminSession(admin.id, admin.username, role);
  return NextResponse.json({ ok: true, redirectTo: homeForRole(role) });
}
