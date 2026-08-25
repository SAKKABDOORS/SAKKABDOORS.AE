import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/DeleteProductButton";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminProductsPage() {
  await requirePageRole("products");

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">المنتجات</h1>
        <div className="flex gap-2">
          <a href="/api/admin/catalog-pdf" download className="btn-secondary">
            تصدير كتالوج PDF
          </a>
          <Link href="/admin/products/new" className="btn-primary">إضافة منتج</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="p-3 text-start font-semibold">المنتج</th>
              <th className="p-3 text-start font-semibold">الفئة</th>
              <th className="p-3 text-start font-semibold">السعر</th>
              <th className="p-3 text-start font-semibold">الحالة</th>
              <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-medium text-ink-900">{p.nameAr}</td>
                <td className="p-3 text-ink-800/70">{p.category.nameAr}</td>
                <td className="p-3">{p.price.toLocaleString("ar-AE")} {p.currency}</td>
                <td className="p-3">
                  <span className={p.inStock ? "badge-success" : "badge-danger"}>
                    {p.inStock ? "متوفر" : "غير متوفر"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                      تعديل
                    </Link>
                    <DeleteProductButton productId={p.id} />
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
