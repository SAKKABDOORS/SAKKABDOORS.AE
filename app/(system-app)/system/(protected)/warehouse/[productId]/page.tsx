import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import InventoryMovementForm from "@/components/InventoryMovementForm";
import LowStockThresholdForm from "@/components/LowStockThresholdForm";

const TYPE_LABELS: Record<string, string> = { IN: "إدخال", OUT: "إخراج", ADJUSTMENT: "تصحيح" };

export default async function SystemWarehouseProductPage({ params }: { params: { productId: string } }) {
  await requireSystemRole("warehouse");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { inventoryMovements: { orderBy: { createdAt: "desc" } } }
  });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">{product.nameAr}</h1>

      <div className="card p-6">
        <p className="text-sm">
          <span className="font-bold text-brand-700">الكمية الحالية بالمخزن:</span>{" "}
          <span className="text-lg font-bold text-brand-700">{product.stockQuantity}</span>
          {product.stockQuantity <= product.lowStockThreshold && (
            <span className="ms-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">مخزون منخفض</span>
          )}
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">تنبيه انخفاض المخزون</h2>
        <LowStockThresholdForm productId={product.id} threshold={product.lowStockThreshold} />
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">تسجيل حركة مخزون</h2>
        <InventoryMovementForm productId={product.id} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-ink-900">سجل الحركات</h2>
        {product.inventoryMovements.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد حركات مسجلة بعد</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100">
              <tr>
                <th className="p-2 text-start font-semibold">التاريخ</th>
                <th className="p-2 text-start font-semibold">النوع</th>
                <th className="p-2 text-start font-semibold">الكمية</th>
                <th className="p-2 text-start font-semibold">ملاحظة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {product.inventoryMovements.map((m) => (
                <tr key={m.id}>
                  <td className="p-2 text-ink-800/70">{new Date(m.createdAt).toLocaleString("ar-AE")}</td>
                  <td className="p-2">{TYPE_LABELS[m.type] ?? m.type}</td>
                  <td className="p-2 font-semibold">{m.quantity}</td>
                  <td className="p-2 text-ink-800/70">{m.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
