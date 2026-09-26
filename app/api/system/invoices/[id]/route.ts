import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { restoreStockForItems } from "@/lib/inventory";
import { reverseForSource } from "@/lib/autoPosting";
import { invoiceItemSchema, formatInvoiceNumber } from "@/lib/invoices";

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

  const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Payment.invoiceId is onDelete: SetNull — past payment records survive,
  // just detached from the deleted invoice.
  const invoice = await prisma.invoice.delete({ where: { id: params.id } });

  // The sale never happened after all — restore the stock deducted when
  // this invoice was created (see app/api/system/invoices/route.ts).
  const items = invoiceItemSchema.array().parse(existing.items);
  await restoreStockForItems(
    items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    `حذف فاتورة #${formatInvoiceNumber(existing.invoiceNumber)}`
  );

  // Best-effort — see lib/autoPosting.ts. Only removes this invoice's own
  // auto-posted entry (AR/Sales Revenue); journal entries auto-posted for
  // its payments survive untouched, same as the payments themselves do.
  try {
    await reverseForSource("Invoice", invoice.id);
  } catch (err) {
    console.error("Failed to reverse accounting entry for deleted invoice:", err);
  }

  await logAudit(session!.email, "delete", "Invoice", invoice.id, `حذف فاتورة #${invoice.invoiceNumber}: ${invoice.customerName}`);
  return NextResponse.json({ ok: true });
}
