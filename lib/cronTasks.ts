import "server-only";
import { prisma } from "@/lib/prisma";
import { sendOverdueInvoicesAlert, sendLowStockAlert, sendQuoteExpiryAlert } from "@/lib/mailer";
import { formatInvoiceNumber } from "@/lib/invoices";
import { formatQuoteNumber } from "@/lib/quotes";

const QUOTE_EXPIRY_WINDOW_DAYS = 3;

// Each function below is one daily-cron check — split out from the route
// handlers so /api/system/cron/daily-alerts can run all three under one
// scheduled Vercel Cron job (staying within the plan's cron-job count
// limit) while each also stays individually callable/testable via its own
// route under app/api/system/cron/*.

export async function checkOverdueInvoices(): Promise<number> {
  const overdue = await prisma.invoice.findMany({
    where: { dueDate: { lt: new Date() }, overdueNotifiedAt: null, status: { not: "PAID" } }
  });
  if (overdue.length === 0) return 0;

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

  await prisma.invoice.updateMany({
    where: { id: { in: overdue.map((inv) => inv.id) } },
    data: { overdueNotifiedAt: new Date() }
  });
  return overdue.length;
}

export async function checkLowStock(): Promise<number> {
  // Prisma's query API can't compare two columns of the same row (no
  // stockQuantity <= lowStockThreshold filter), so the not-yet-notified
  // candidates are narrowed in the DB and the threshold check runs in JS —
  // fine at this catalog's scale (a few dozen products, not millions).
  const candidates = await prisma.product.findMany({ where: { lowStockNotifiedAt: null } });
  const low = candidates.filter((p) => p.stockQuantity <= p.lowStockThreshold);
  if (low.length === 0) return 0;

  await sendLowStockAlert(
    low.map((p) => ({ nameAr: p.nameAr, stockQuantity: p.stockQuantity, lowStockThreshold: p.lowStockThreshold }))
  );

  await prisma.product.updateMany({
    where: { id: { in: low.map((p) => p.id) } },
    data: { lowStockNotifiedAt: new Date() }
  });
  return low.length;
}

export async function checkQuoteExpiry(): Promise<number> {
  const windowEnd = new Date(Date.now() + QUOTE_EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const expiring = await prisma.quote.findMany({
    where: { expiryDate: { lt: windowEnd }, expiryNotifiedAt: null, invoices: { none: {} } }
  });
  if (expiring.length === 0) return 0;

  await sendQuoteExpiryAlert(
    expiring.map((q) => ({
      quoteNumber: formatQuoteNumber(q.quoteNumber),
      customerName: q.customerName,
      customerPhone: q.customerPhone,
      grandTotal: q.grandTotal,
      currency: q.currency,
      expiryDate: q.expiryDate!
    }))
  );

  await prisma.quote.updateMany({
    where: { id: { in: expiring.map((q) => q.id) } },
    data: { expiryNotifiedAt: new Date() }
  });
  return expiring.length;
}
