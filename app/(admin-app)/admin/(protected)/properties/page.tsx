import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminPropertiesPage() {
  await requirePageRole("properties");

  const properties = await prisma.property.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">العقارات</h1>
        <Link href="/admin/properties/new" className="btn-primary">إضافة عقار</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">العقار</th>
              <th className="p-3 text-start font-semibold">المنطقة</th>
              <th className="p-3 text-start font-semibold">السعر</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {properties.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium text-ink-900">{p.titleAr}</td>
                <td className="p-3 text-ink-800/70">{p.regionAr}</td>
                <td className="p-3">{p.price.toLocaleString("ar-AE")} {p.currency}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/properties/${p.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeletePropertyButton propertyId={p.id} />
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
