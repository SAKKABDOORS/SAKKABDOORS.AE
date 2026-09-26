import "server-only";
import { prisma } from "@/lib/prisma";
import { normalBalanceFor, type AccountTypeValue } from "@/lib/accounts";

export type AccountBalance = {
  accountId: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  type: AccountTypeValue;
  totalDebit: number;
  totalCredit: number;
  // Signed balance in the account's own normal-balance direction — see
  // lib/accounts.ts's normalBalanceFor. Always the number a report should
  // actually display.
  balance: number;
};

// One groupBy call across JournalEntryLine, joined with Account rows in JS
// to apply each account's debit-normal/credit-normal sign — same idiom as
// prisma.payment.aggregate({ _sum }) already used in
// app/api/system/invoices/[id]/payments/route.ts, just grouped instead of
// summed to one number. Fine at SMB volume; revisit only if a single
// account's line count grows into the thousands.
export async function getAccountBalances(opts: {
  asOf?: Date;
  from?: Date;
  to?: Date;
  types?: AccountTypeValue[];
  includeZero?: boolean;
}): Promise<AccountBalance[]> {
  const dateFilter = opts.asOf
    ? { lte: opts.asOf }
    : opts.from || opts.to
      ? { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) }
      : undefined;

  const [accounts, grouped] = await Promise.all([
    prisma.account.findMany({
      where: opts.types ? { type: { in: opts.types } } : undefined,
      orderBy: { code: "asc" }
    }),
    prisma.journalEntryLine.groupBy({
      by: ["accountId"],
      where: dateFilter ? { journalEntry: { date: dateFilter } } : undefined,
      _sum: { debit: true, credit: true }
    })
  ]);

  const sumsByAccount = new Map(grouped.map((g) => [g.accountId, g._sum]));

  const balances = accounts.map((account) => {
    const sums = sumsByAccount.get(account.id);
    const totalDebit = sums?.debit ?? 0;
    const totalCredit = sums?.credit ?? 0;
    return {
      accountId: account.id,
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn,
      type: account.type,
      totalDebit,
      totalCredit,
      balance: normalBalanceFor(account.type, totalDebit, totalCredit)
    };
  });

  return opts.includeZero === false ? balances.filter((b) => b.totalDebit > 0 || b.totalCredit > 0) : balances;
}
