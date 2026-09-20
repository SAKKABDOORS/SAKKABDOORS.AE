import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOverdueInvoicesAlert } from "@/lib/mailer";
import { formatInvoiceNumber } from "@/lib/invoices";

export const dynamic = "force-dynamic";

// Triggered daily by the Vercel Cron job defined in vercel.json. Vercel
// signs cron requests with an "Authorization: Bearer <CRON_SECRET>" header
// when CRON_SECRET is set — check it so this can't be hit by anyone else
// (it has no other auth, since it's not a logged-in system user acting).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const overdue = await prisma.invoice.findMany({
    where: {
      dueDate: { lt: now },
      overdueNotifiedAt: null,
      status: { not: "PAID" }
    }
  });

  if (overdue.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  try {
    await sendOverdueInvoicesAlert(
      overdue.map((inv) => ({
        invoiceNumber: formatInvoiceNumber(inv.invoiceNumber),
        customerName: inv.customerName,
        customerPhone: inv.customerPhone,
        remaining: inv.totalAmount - inv.paidAmount,
        currency: "AED",
        dueDate: inv.dueDate!
      }))
    );
  } catch (err) {
    console.error("Failed to send overdue invoices alert:", err);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }

  await prisma.invoice.updateMany({
    where: { id: { in: overdue.map((inv) => inv.id) } },
    data: { overdueNotifiedAt: now }
  });

  return NextResponse.json({ notified: overdue.length });
}
