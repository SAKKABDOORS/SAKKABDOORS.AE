// Pure math/validation only — no "server-only" or next/headers imports, so
// this stays safe to import from the client-side QuoteForm for a live
// running total, as well as from the API routes (the authoritative
// recompute — client-submitted totals are never trusted) and the PDF.
import { z } from "zod";

export const quoteItemInputSchema = z.object({
  productId: z.string().min(1).nullable().optional(),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  customerTypeId: z.string().min(1).nullable().optional(),
  discountPercent: z.number().min(0).max(100).default(0)
});

export const quoteInputSchema = z.object({
  orderId: z.string().min(1).nullable().optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().nullable().optional().or(z.literal("")),
  customerAddress: z.string().nullable().optional(),
  customerNumber: z.string().nullable().optional(),
  addressedTo: z.string().nullable().optional(),
  responsibleName: z.string().nullable().optional(),
  responsiblePhone: z.string().nullable().optional(),
  issueDate: z.string().min(1),
  expiryDate: z.string().nullable().optional(),
  shippingFee: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  currency: z.string().min(1).max(10).default("AED"),
  termsAr: z.string().min(1),
  termsEn: z.string().min(1),
  customerNote: z.string().nullable().optional(),
  items: z.array(quoteItemInputSchema).min(1)
});

export type QuoteItemInput = z.infer<typeof quoteItemInputSchema>;
export type QuoteInput = z.infer<typeof quoteInputSchema>;

export function computeLineTotal(item: { quantity: number; unitPrice: number; discountPercent: number }): number {
  const raw = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
  return Math.round(raw * 100) / 100;
}

export function computeQuoteTotals(
  items: { quantity: number; unitPrice: number; discountPercent: number }[],
  shippingFee: number,
  discountAmount: number
): { subtotal: number; grandTotal: number } {
  const subtotal = Math.round(items.reduce((sum, i) => sum + computeLineTotal(i), 0) * 100) / 100;
  const grandTotal = Math.round((subtotal + shippingFee - discountAmount) * 100) / 100;
  return { subtotal, grandTotal };
}

export function formatQuoteNumber(n: number): string {
  return String(n).padStart(5, "0");
}
