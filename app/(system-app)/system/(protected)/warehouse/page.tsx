import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";

const MATERIAL_LABELS_AR: Record<string, string> = {
  WPC: "WPC",
  UPVC: "COMPOSITE",
  ALUMINUM: "ألمنيوم",
  STEEL: "حديد"
};

export default async function SystemWarehousePage() {
  await requireSystemRole("warehouse");

  const products = await prisma.product.findMany({
    select: { id: true, nameAr: true, material: true, stockQuantity: true, inStock: true },
    orderBy: { nameAr: "asc" }
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">المخزن</h1>
      <p className="mb-4 text-sm text-ink-800/60">
        نفس المنتجات الموجودة بكتالوج الموقع الرئيسي — الكمية هون داخلية فقط، ما بتأثر على شارة "متوفر" بالموقع.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">المنتج</th>
              <th className="p-3 text-start font-semibold">النوع</th>
              <th className="p-3 text-start font-semibold">الكمية بالمخزن</th>
              <th className="p-3 text-start font-semibold">متوفر بالموقع</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-800/60">
                  لا يوجد منتجات بعد
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium text-ink-900">{p.nameAr}</td>
                <td className="p-3 text-ink-800/70">{MATERIAL_LABELS_AR[p.material] ?? p.material}</td>
                <td className="p-3">
                  <span className={p.stockQuantity > 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="p-3">
                  {p.inStock ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">متوفر</span>
                  ) : (
                    <span className="rounded-full bg-ink-800/10 px-2 py-1 text-xs font-semibold text-ink-800/60">غير متوفر</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/warehouse/${p.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                    تسجيل حركة
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
