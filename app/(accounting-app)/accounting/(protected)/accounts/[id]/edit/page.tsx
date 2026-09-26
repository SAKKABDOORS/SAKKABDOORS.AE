import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAccountingRole } from "@/lib/requireAccountingRole";
import AccountForm from "@/components/AccountForm";

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  await requireAccountingRole();

  const [account, parentOptions] = await Promise.all([
    prisma.account.findUnique({ where: { id: params.id }, include: { _count: { select: { lines: true } } } }),
    prisma.account.findMany({ orderBy: { code: "asc" } })
  ]);
  if (!account) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل حساب</h1>
      <AccountForm account={account} parentOptions={parentOptions} typeLocked={account._count.lines > 0} />
    </div>
  );
}
