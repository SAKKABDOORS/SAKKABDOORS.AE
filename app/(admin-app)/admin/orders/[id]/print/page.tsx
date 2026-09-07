import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import OrderPrintView from "@/components/admin/OrderPrintView";

// Deliberately outside admin/(protected) — that layout renders the sidebar
// chrome, which this page has no use for (it's opened in its own tab, just
// to trigger the browser's print dialog). Still gated by the same
// requirePageRole() check as the rest of /admin/orders.
export default async function OrderPrintPage({ params }: { params: { id: string } }) {
  await requirePageRole("orders");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } }
  });

  if (!order) {
    notFound();
  }

  return (
    <OrderPrintView
      order={{
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        city: order.city,
        message: order.message,
        status: order.status,
        items: order.items.map((item) => ({
          id: item.id,
          nameAr: item.product.nameAr,
          quantity: item.quantity,
          measurement: item.measurement
        }))
      }}
    />
  );
}
