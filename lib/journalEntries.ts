// Pure math/validation only — no server-only imports — mirrors lib/quotes.ts's
// shape: safe to import from a client-form component for a live balance
// check as well as from the API route (the authoritative recompute —
// client-submitted totals are never trusted).
import { z } from "zod";

export const journalLineInputSchema = z
  .object({
    accountId: z.string().min(1),
    debit: z.number().nonnegative().default(0),
    credit: z.number().nonnegative().default(0),
    note: z.string().max(300).optional()
  })
  // Exactly one side of a line carries an amount — a line that's both (or
  // neither) debit and credit isn't a valid double-entry line.
  .refine((line) => (line.debit > 0) !== (line.credit > 0), {
    message: "كل سطر لازم يكون مدين أو دائن، مش الاثنين ولا ولا واحد"
  });
export type JournalLineInput = z.infer<typeof journalLineInputSchema>;

export const journalEntryInputSchema = z
  .object({
    date: z.string().min(1),
    description: z.string().min(1),
    reference: z.string().max(200).optional(),
    lines: z.array(journalLineInputSchema).min(2)
  })
  .refine((entry) => isBalanced(entry.lines), {
    message: "مجموع المدين لازم يساوي مجموع الدائن",
    path: ["lines"]
  });
export type JournalEntryInput = z.infer<typeof journalEntryInputSchema>;

export function computeEntryTotals(lines: { debit: number; credit: number }[]) {
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  return { totalDebit, totalCredit };
}

// Sub-cent tolerance for float rounding — never compare debit/credit sums
// with strict equality.
export function isBalanced(lines: { debit: number; credit: number }[]): boolean {
  const { totalDebit, totalCredit } = computeEntryTotals(lines);
  return totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.005;
}

export function formatEntryNumber(n: number): string {
  return String(n).padStart(5, "0");
}
