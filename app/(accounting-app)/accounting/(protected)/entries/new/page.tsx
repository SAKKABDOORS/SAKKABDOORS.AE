import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import JournalEntryForm from "@/components/JournalEntryForm";

export default async function NewJournalEntryPage() {
  await requireAccountingRole();

  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة قيد يومية</h1>
      {accounts.length === 0 ? (
        <p className="text-sm text-ink-800/60">لازم تضيف حسابات بدليل الحسابات أولاً قبل ما تقدر تسجل قيد.</p>
      ) : (
        <JournalEntryForm accounts={accounts} />
      )}
    </div>
  );
}
