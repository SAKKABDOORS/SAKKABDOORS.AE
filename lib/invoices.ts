// Pure helpers only — no server-only imports — mirrors lib/quotes.ts's shape.
import { z } from "zod";

export const invoiceItemSchema = z.object({
  // Carried over from the source QuoteItem so warehouse stock can be
  // deducted/restored automatically (see app/api/system/invoices/route.ts
  // and .../[id]/route.ts) — null for free-text lines with no catalog
  // product behind them.
  productId: z.string().nullable().optional(),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountPercent: z.number().min(0).max(100).default(0),
  lineTotal: z.number()
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export function formatInvoiceNumber(n: number): string {
  return String(n).padStart(5, "0");
}

export type InvoiceStatusValue = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export function computeInvoiceStatus(totalAmount: number, paidAmount: number): InvoiceStatusValue {
  if (paidAmount <= 0) return "UNPAID";
  if (paidAmount >= totalAmount) return "PAID";
  return "PARTIALLY_PAID";
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatusValue, string> = {
  UNPAID: "غير مدفوعة",
  PARTIALLY_PAID: "مدفوعة جزئياً",
  PAID: "مدفوعة بالكامل"
};
