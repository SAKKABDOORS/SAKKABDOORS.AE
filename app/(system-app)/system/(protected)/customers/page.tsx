import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCustomerButton from "@/components/DeleteCustomerButton";
import SystemSearchBar from "@/components/SystemSearchBar";
import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function SystemCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireSystemRole("customers");

  const q = searchParams.q?.trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: [{ nameAr: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { customerType: true }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">العملاء</h1>
        <Link href="/customers/new" className="btn-primary">إضافة عميل</Link>
      </div>

      <SystemSearchBar action="/customers" q={q} placeholder="الاسم أو رقم الهاتف" />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الاسم</th>
              <th className="p-3 text-start font-semibold">الهاتف</th>
              <th className="p-3 text-start font-semibold">النوع</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-800/60">
                  {q ? "ما في نتائج مطابقة للبحث" : "لا يوجد عملاء بعد"}
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium text-ink-900">{c.nameAr}</td>
                <td className="p-3 text-ink-800/70">{c.phone}</td>
                <td className="p-3 text-ink-800/70">{c.customerType?.nameAr ?? "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/customers/${c.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteCustomerButton customerId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
