import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  await prisma.employeeDeduction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
