import { prisma } from "@/lib/prisma";
import { getOrderStatusInfo } from "@/lib/orderStatus";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminOrdersPage() {
  await requirePageRole("orders");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } }
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">الطلبات</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-ink-800/60">لا يوجد طلبات بعد</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-100 bg-brand-50 text-start">
              <tr>
                <th className="p-3 text-start font-semibold">التاريخ</th>
                <th className="p-3 text-start font-semibold">العميل</th>
                <th className="p-3 text-start font-semibold">الهاتف / الإيميل</th>
                <th className="p-3 text-start font-semibold">المنتجات</th>
                <th className="p-3 text-start font-semibold">الحالة</th>
                <th className="p-3 text-start font-semibold">إيميل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 whitespace-nowrap text-ink-800/70">
                    {new Date(o.createdAt).toLocaleString("ar-AE")}
                  </td>
                  <td className="p-3 font-medium text-ink-900">{o.customerName}</td>
                  <td className="p-3">
                    <div>{o.phone}</div>
                    <div className="text-xs text-ink-800/60">{o.email}</div>
                  </td>
                  <td className="p-3">
                    {o.items.length === 0 ? (
                      <span className="text-ink-800/50">استفسار عام</span>
                    ) : (
                      <ul>
                        {o.items.map((item) => (
                          <li key={item.id}>
                            {item.product.nameAr} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={getOrderStatusInfo(o.status).badgeClass}>
                      {getOrderStatusInfo(o.status).label}
                    </span>
                  </td>
                  <td className="p-3">{o.emailedOk ? "✅" : "⚠️"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
