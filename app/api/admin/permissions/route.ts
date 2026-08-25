import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminApi";
import { PAGE_KEYS } from "@/lib/adminRoles";
import { getAllRolePermissions, saveRolePermissions } from "@/lib/rolePermissions";

// "permissions" itself is deliberately never assignable to MANAGER/EMPLOYEE
// here — only SUPER_ADMIN can ever change who sees what, otherwise a
// MANAGER could grant themselves (or anyone) more access than intended.
const assignablePageKeys = PAGE_KEYS.filter((key) => key !== "permissions");
const pageKeySchema = z.enum(assignablePageKeys as [string, ...string[]]);

const saveSchema = z.object({
  MANAGER: z.array(pageKeySchema),
  EMPLOYEE: z.array(pageKeySchema)
});

// SUPER_ADMIN-only: current MANAGER/EMPLOYEE page permissions.
export async function GET() {
  const { response } = await requireAdmin(["SUPER_ADMIN"]);
  if (response) return response;

  const permissions = await getAllRolePermissions();
  return NextResponse.json(permissions);
}

// SUPER_ADMIN-only: overwrite MANAGER/EMPLOYEE page permissions.
export async function PUT(request: NextRequest) {
  const { response } = await requireAdmin(["SUPER_ADMIN"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  await Promise.all([
    saveRolePermissions("MANAGER", parsed.data.MANAGER as never),
    saveRolePermissions("EMPLOYEE", parsed.data.EMPLOYEE as never)
  ]);

  return NextResponse.json({ ok: true });
}
