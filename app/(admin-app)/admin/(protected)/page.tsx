import { DoorOpen, Inbox, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOrderStatusInfo } from "@/lib/orderStatus";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminDashboardPage() {
  await requirePageRole(["SUPER_ADMIN", "MANAGER"]);

  const [productCount, newOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }
    })
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">لوحة التحكم</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-4 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <DoorOpen className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm text-ink-800/60">إجمالي المنتجات</div>
            <div className="mt-1 text-3xl font-bold text-brand-700">{productCount}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm text-ink-800/60">طلبات جديدة</div>
            <div className="mt-1 text-3xl font-bold text-brand-700">{newOrders}</div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ink-900">أحدث الطلبات</h2>
        {recentOrders.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <Inbox className="h-8 w-8 text-ink-800/30" strokeWidth={1.5} />
            <p className="text-sm text-ink-800/60">لا يوجد طلبات بعد</p>
          </div>
        ) : (
          <div className="card divide-y divide-brand-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div>
                  <div className="font-medium text-ink-900">{o.customerName}</div>
                  <div className="text-ink-800/60">
                    {o.phone}
                    {o.items.length > 0
                      ? ` — ${o.items.map((i) => `${i.product.nameAr} ×${i.quantity}`).join("، ")}`
                      : ""}
                  </div>
                </div>
                <span className={getOrderStatusInfo(o.status).badgeClass}>
                  {getOrderStatusInfo(o.status).label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
