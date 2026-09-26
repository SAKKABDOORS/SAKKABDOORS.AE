import "server-only";
import { prisma } from "@/lib/prisma";
import { formatInvoiceNumber } from "@/lib/invoices";
import { SUSPENSE_ACCOUNT_CODE } from "@/lib/accounts";

// Safe auto-posting from the existing system.sakkabdoors.ae Invoice/Payment
// flow into the formal double-entry ledger. Every function here is called
// as best-effort from the existing app/api/system/* routes — wrapped in
// try/catch there, exactly like the WhatsApp/email notification calls
// elsewhere in this codebase: a posting failure must never block the real
// business action (creating the invoice, recording the payment).
//
// Since Payment.category/method are free text (no enum — see the schema
// comment on Payment), this never guesses an account: it only posts
// through CATEGORY_DEFAULTS or the OWNER-editable CategoryAccountMapping
// table, falling back to the Suspense account (3999) so a wrong guess is
// never silent — it's visibly flagged on the Trial Balance/General Ledger
// instead.

const CASH_ACCOUNT_CODE = "1000";
const ACCOUNTS_RECEIVABLE_CODE = "1100";
const SALES_REVENUE_CODE = "4000";

// Sensible defaults for the categories the app itself creates (see
// app/api/system/invoices/[id]/payments, employees/[id]/pay-salary,
// employees/[id]/vouchers) — the OWNER can override any of these, or add
// mappings for their own manual-payment categories, via
// CategoryAccountMapping (/accounting/settings).
const CATEGORY_DEFAULTS: Record<string, string> = {
  salary: "5100",
  voucher: "5100"
};

async function getAccountByCode(code: string) {
  const account = await prisma.account.findUnique({ where: { code } });
  if (!account) {
    throw new Error(`Auto-posting account with code ${code} not found — seed the starter chart of accounts first`);
  }
  return account;
}

async function resolveCategoryAccount(category: string) {
  const mapping = await prisma.categoryAccountMapping.findUnique({ where: { category } });
  if (mapping) return mapping.accountId;

  const defaultCode = CATEGORY_DEFAULTS[category];
  if (defaultCode) {
    const account = await getAccountByCode(defaultCode);
    return account.id;
  }

  const suspense = await getAccountByCode(SUSPENSE_ACCOUNT_CODE);
  return suspense.id;
}

async function nextEntryNumber(): Promise<number> {
  const last = await prisma.journalEntry.findFirst({ orderBy: { entryNumber: "desc" }, select: { entryNumber: true } });
  return (last?.entryNumber ?? 0) + 1;
}

// A converted quote is a confirmed sale — Dr Accounts Receivable / Cr Sales
// Revenue for the invoice total.
export async function postInvoiceCreated(invoice: { id: string; invoiceNumber: number; totalAmount: number; customerName: string }) {
  if (invoice.totalAmount <= 0) return;

  const [ar, sales] = await Promise.all([getAccountByCode(ACCOUNTS_RECEIVABLE_CODE), getAccountByCode(SALES_REVENUE_CODE)]);
  const entryNumber = await nextEntryNumber();

  await prisma.journalEntry.create({
    data: {
      entryNumber,
      date: new Date(),
      description: `فاتورة #${formatInvoiceNumber(invoice.invoiceNumber)} — ${invoice.customerName}`,
      createdByEmail: "auto-posting",
      sourceType: "Invoice",
      sourceId: invoice.id,
      lines: {
        create: [
          { accountId: ar.id, debit: invoice.totalAmount, credit: 0, position: 0 },
          { accountId: sales.id, debit: 0, credit: invoice.totalAmount, position: 1 }
        ]
      }
    }
  });
}

// A payment recorded against an invoice — Dr Cash / Cr Accounts Receivable.
export async function postInvoicePayment(payment: { id: string; amount: number; invoiceId: string | null }, invoice: { invoiceNumber: number; customerName: string }) {
  if (payment.amount <= 0) return;

  const [cash, ar] = await Promise.all([getAccountByCode(CASH_ACCOUNT_CODE), getAccountByCode(ACCOUNTS_RECEIVABLE_CODE)]);
  const entryNumber = await nextEntryNumber();

  await prisma.journalEntry.create({
    data: {
      entryNumber,
      date: new Date(),
      description: `دفعة على فاتورة #${formatInvoiceNumber(invoice.invoiceNumber)} — ${invoice.customerName}`,
      createdByEmail: "auto-posting",
      sourceType: "Payment",
      sourceId: payment.id,
      lines: {
        create: [
          { accountId: cash.id, debit: payment.amount, credit: 0, position: 0 },
          { accountId: ar.id, debit: 0, credit: payment.amount, position: 1 }
        ]
      }
    }
  });
}

// A standalone Payment not tied to an invoice — manual income/expense entry
// (salary, voucher, or an arbitrary manually-typed category) — one side is
// always Cash, the other resolved via resolveCategoryAccount().
export async function postStandalonePayment(payment: { id: string; type: "INCOME" | "EXPENSE"; category: string; amount: number; note: string | null }) {
  if (payment.amount <= 0) return;

  const [cash, categoryAccount] = await Promise.all([getAccountByCode(CASH_ACCOUNT_CODE), resolveCategoryAccount(payment.category)]);
  const entryNumber = await nextEntryNumber();
  const description = payment.note || `دفعة ${payment.type === "INCOME" ? "دخل" : "مصروف"} — ${payment.category}`;

  const lines =
    payment.type === "INCOME"
      ? [
          { accountId: cash.id, debit: payment.amount, credit: 0, position: 0 },
          { accountId: categoryAccount, debit: 0, credit: payment.amount, position: 1 }
        ]
      : [
          { accountId: categoryAccount, debit: payment.amount, credit: 0, position: 0 },
          { accountId: cash.id, debit: 0, credit: payment.amount, position: 1 }
        ];

  await prisma.journalEntry.create({
    data: {
      entryNumber,
      date: new Date(),
      description,
      createdByEmail: "auto-posting",
      sourceType: "Payment",
      sourceId: payment.id,
      lines: { create: lines }
    }
  });
}

// Called when the source Invoice or Payment is deleted in the existing
// system — the sale/payment didn't happen after all, so its auto-posted
// entry is removed too. Mirrors lib/inventory.ts's restoreStockForItems
// reasoning exactly, applied to the ledger instead of warehouse stock.
export async function reverseForSource(sourceType: "Invoice" | "Payment", sourceId: string) {
  await prisma.journalEntry.deleteMany({ where: { sourceType, sourceId } });
}
