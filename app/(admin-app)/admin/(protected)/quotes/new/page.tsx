import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import { getSiteSetting } from "@/lib/siteContent";
import QuoteForm, { type QuoteOrderPrefill } from "@/components/QuoteForm";

export default async function NewQuotePage({ searchParams }: { searchParams: { fromOrder?: string } }) {
  await requirePageRole("quotes");

  const defaultTerms = await getSiteSetting("quoteTerms");

  let orderPrefill: QuoteOrderPrefill | undefined;
  if (searchParams.fromOrder) {
    const order = await prisma.order.findUnique({
      where: { id: searchParams.fromOrder },
      include: { items: { include: { product: true } } }
    });
    if (order) {
      orderPrefill = {
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.phone,
        customerEmail: order.email,
        items: order.items.map((item) => ({
          productId: item.productId,
          descriptionAr: item.product.nameAr,
          descriptionEn: item.product.nameEn,
          quantity: item.quantity,
          unitPrice: item.product.price,
          customerTypeId: null,
          discountPercent: 0
        }))
      };
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">عرض سعر جديد</h1>
      <QuoteForm orderPrefill={orderPrefill} defaultTerms={defaultTerms} />
    </div>
  );
}
