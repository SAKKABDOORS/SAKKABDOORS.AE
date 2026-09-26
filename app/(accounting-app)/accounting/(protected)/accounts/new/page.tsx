import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import AccountForm from "@/components/AccountForm";

export default async function NewAccountPage() {
  await requireAccountingRole();

  const parentOptions = await prisma.account.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة حساب</h1>
      <AccountForm parentOptions={parentOptions} />
    </div>
  );
}
