// Pure helpers only — no server-only imports — mirrors lib/quotes.ts's shape.
import { z } from "zod";

export const ACCOUNT_TYPES = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const;
export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountTypeValue, string> = {
  ASSET: "أصول",
  LIABILITY: "التزامات",
  EQUITY: "حقوق ملكية",
  INCOME: "إيرادات",
  EXPENSE: "مصروفات"
};

export const accountInputSchema = z.object({
  code: z.string().min(1).max(20),
  nameAr: z.string().min(1),
  nameEn: z.string().max(200).optional(),
  type: z.enum(ACCOUNT_TYPES),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
});
export type AccountInput = z.infer<typeof accountInputSchema>;

// ASSET/EXPENSE increase with a debit (debit-normal); LIABILITY/EQUITY/INCOME
// increase with a credit (credit-normal). Used to turn a raw
// {debit, credit} sum into a single signed balance per account for reports —
// see lib/accountingReports.ts.
export function normalBalanceFor(type: AccountTypeValue, debit: number, credit: number): number {
  const isDebitNormal = type === "ASSET" || type === "EXPENSE";
  return isDebitNormal ? debit - credit : credit - debit;
}

// Reserved code for the safe fallback target when auto-posting can't
// confidently map a Payment.category to a real account (see
// lib/autoPosting.ts) — never guesses, always lands here instead so it's
// visibly flagged for the OWNER to reclassify.
export const SUSPENSE_ACCOUNT_CODE = "3999";

export type StarterAccount = { code: string; nameAr: string; nameEn: string; type: AccountTypeValue };

// A reasonable starting chart of accounts for a UAE door-manufacturing +
// real-estate SMB — seeded once via the "تحميل دليل الحسابات الافتراضي"
// button on an empty Chart of Accounts page (upsert on `code`, safe to
// re-run). The client's bookkeeper is expected to review/adjust this list;
// it's a starting point, not a fixed requirement.
export const STARTER_CHART_OF_ACCOUNTS: StarterAccount[] = [
  { code: "1000", nameAr: "الصندوق", nameEn: "Cash", type: "ASSET" },
  { code: "1010", nameAr: "البنك", nameEn: "Bank", type: "ASSET" },
  { code: "1100", nameAr: "حسابات العملاء", nameEn: "Accounts Receivable", type: "ASSET" },
  { code: "1200", nameAr: "مخزون الأبواب والخامات", nameEn: "Inventory", type: "ASSET" },
  { code: "1210", nameAr: "عقارات معدة للبيع", nameEn: "Real Estate Held for Sale", type: "ASSET" },
  { code: "1300", nameAr: "ضريبة القيمة المضافة القابلة للاسترداد", nameEn: "VAT Input", type: "ASSET" },
  { code: "1500", nameAr: "أصول ثابتة - معدات وآلات", nameEn: "Fixed Assets", type: "ASSET" },
  { code: "1510", nameAr: "مجمع استهلاك الأصول الثابتة", nameEn: "Accumulated Depreciation", type: "ASSET" },
  { code: "2000", nameAr: "حسابات الموردين", nameEn: "Accounts Payable", type: "LIABILITY" },
  { code: "2100", nameAr: "ضريبة القيمة المضافة المستحقة", nameEn: "VAT Payable", type: "LIABILITY" },
  { code: "2200", nameAr: "رواتب مستحقة الدفع", nameEn: "Accrued Salaries", type: "LIABILITY" },
  { code: "2300", nameAr: "قروض", nameEn: "Loans Payable", type: "LIABILITY" },
  { code: "3000", nameAr: "رأس المال", nameEn: "Owner's Equity", type: "EQUITY" },
  { code: "3100", nameAr: "مسحوبات الملاك", nameEn: "Owner's Drawings", type: "EQUITY" },
  { code: "3900", nameAr: "الأرباح المرحلة", nameEn: "Retained Earnings", type: "EQUITY" },
  { code: SUSPENSE_ACCOUNT_CODE, nameAr: "حساب معلق (يحتاج تصنيف)", nameEn: "Suspense", type: "EQUITY" },
  { code: "4000", nameAr: "إيرادات مبيعات الأبواب", nameEn: "Sales Revenue", type: "INCOME" },
  { code: "4100", nameAr: "إيرادات العقارات", nameEn: "Real Estate Revenue", type: "INCOME" },
  { code: "4900", nameAr: "إيرادات أخرى", nameEn: "Other Income", type: "INCOME" },
  { code: "5000", nameAr: "تكلفة البضاعة المباعة", nameEn: "Cost of Goods Sold", type: "EXPENSE" },
  { code: "5100", nameAr: "رواتب وأجور", nameEn: "Salaries Expense", type: "EXPENSE" },
  { code: "5200", nameAr: "إيجار", nameEn: "Rent Expense", type: "EXPENSE" },
  { code: "5300", nameAr: "كهرباء وماء", nameEn: "Utilities Expense", type: "EXPENSE" },
  { code: "5400", nameAr: "تسويق وإعلان", nameEn: "Marketing Expense", type: "EXPENSE" },
  { code: "5500", nameAr: "مصاريف إدارية عامة", nameEn: "G&A Expense", type: "EXPENSE" },
  { code: "5900", nameAr: "مصاريف أخرى", nameEn: "Other Expense", type: "EXPENSE" }
];
