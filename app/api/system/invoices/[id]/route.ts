import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { createdAt: "desc" } } }
  });
  if (!invoice) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(invoice);
}

const updateSchema = z.object({ dueDate: z.string().nullable() });

// Only field editable after creation besides payments — a due date, set
// manually per invoice (see the schema comment on Invoice.dueDate).
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      // Changing the due date forward means it isn't overdue under the new
      // date until the cron re-evaluates it — clear any past alert flag so
      // a fresh alert can fire if it becomes overdue again later.
      overdueNotifiedAt: null
    }
  });
  await logAudit(session!.email, "update", "Invoice", invoice.id, `تعديل تاريخ استحقاق فاتورة #${invoice.invoiceNumber}`);
  return NextResponse.json(invoice);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  // Payment.invoiceId is onDelete: SetNull — past payment records survive,
  // just detached from the deleted invoice.
  const invoice = await prisma.invoice.delete({ where: { id: params.id } });
  await logAudit(session!.email, "delete", "Invoice", invoice.id, `حذف فاتورة #${invoice.invoiceNumber}: ${invoice.customerName}`);
  return NextResponse.json({ ok: true });
}
