import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// SUPER_ADMIN is deliberately not an assignable option here — it's a single,
// fixed owner account (seeded once), not something invited from this form.
const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "٣ أحرف على الأقل")
    .max(32)
    .regex(/^[a-zA-Z0-9_.-]+$/, "أحرف وأرقام إنجليزية فقط (بدون مسافات)"),
  password: z.string().min(8, "٨ أحرف على الأقل"),
  role: z.enum(["MANAGER", "EMPLOYEE"])
});

// List every admin account (never the password hash — only what the "team"
// screen needs to render). Team management is SUPER_ADMIN/MANAGER territory
// — an employee has no reason to see or manage other accounts.
export async function GET() {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(admins);
}

// Create a new admin account, as MANAGER or EMPLOYEE only (see createSchema).
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin(["SUPER_ADMIN", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const admin = await prisma.admin.create({
    data: { username: parsed.data.username, passwordHash, role: parsed.data.role },
    select: { id: true, username: true, role: true, createdAt: true }
  });

  return NextResponse.json(admin, { status: 201 });
}
