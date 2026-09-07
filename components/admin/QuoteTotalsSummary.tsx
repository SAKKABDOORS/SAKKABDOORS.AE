import { computeQuoteTotals, type QuoteItemInput } from "@/lib/quotes";

export default function QuoteTotalsSummary({
  items,
  shippingFee,
  discountAmount,
  currency
}: {
  items: QuoteItemInput[];
  shippingFee: number;
  discountAmount: number;
  currency: string;
}) {
  const { subtotal, grandTotal } = computeQuoteTotals(items, shippingFee, discountAmount);

  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-brand-100 p-4 text-sm sm:grid-cols-4">
      <div>
        <div className="text-ink-800/60">المجموع الجزئي</div>
        <div className="font-semibold text-ink-900">{subtotal.toFixed(2)} {currency}</div>
      </div>
      <div>
        <div className="text-ink-800/60">رسوم الشحن</div>
        <div className="font-semibold text-ink-900">{shippingFee.toFixed(2)} {currency}</div>
      </div>
      <div>
        <div className="text-ink-800/60">خصم إضافي</div>
        <div className="font-semibold text-ink-900">-{discountAmount.toFixed(2)} {currency}</div>
      </div>
      <div>
        <div className="text-ink-800/60">الإجمالي</div>
        <div className="text-lg font-bold text-brand-700">{grandTotal.toFixed(2)} {currency}</div>
      </div>
    </div>
  );
}
