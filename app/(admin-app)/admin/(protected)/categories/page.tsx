import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminCategoriesPage() {
  await requirePageRole("categories");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameAr: "asc" }
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">الفئات</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">الفئة</th>
              <th className="p-3 text-start font-semibold">عدد المنتجات</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium text-ink-900">{c.nameAr} / {c.nameEn}</td>
                <td className="p-3 text-ink-800/70">{c._count.products}</td>
                <td className="p-3">
                  <div className="flex justify-end">
                    <Link href={`/admin/categories/${c.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
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
