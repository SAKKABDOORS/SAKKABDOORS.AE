"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerType, Product, Quote, QuoteItem } from "@prisma/client";
import QuoteItemsTable, { emptyItem } from "@/components/admin/QuoteItemsTable";
import QuoteTotalsSummary from "@/components/admin/QuoteTotalsSummary";
import { quoteInputSchema, type QuoteItemInput } from "@/lib/quotes";

export type QuoteOrderPrefill = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: QuoteItemInput[];
};

function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export default function QuoteForm({
  quote,
  orderPrefill,
  defaultTerms
}: {
  quote?: Quote & { items: QuoteItem[] };
  orderPrefill?: QuoteOrderPrefill;
  defaultTerms: { ar: string; en: string };
}) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);

  const [customerName, setCustomerName] = useState(quote?.customerName ?? orderPrefill?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(quote?.customerPhone ?? orderPrefill?.customerPhone ?? "");
  const [customerEmail, setCustomerEmail] = useState(quote?.customerEmail ?? orderPrefill?.customerEmail ?? "");
  const [customerAddress, setCustomerAddress] = useState(quote?.customerAddress ?? "");
  const [customerNumber, setCustomerNumber] = useState(quote?.customerNumber ?? "");
  const [addressedTo, setAddressedTo] = useState(quote?.addressedTo ?? "");
  const [responsibleName, setResponsibleName] = useState(quote?.responsibleName ?? "");
  const [responsiblePhone, setResponsiblePhone] = useState(quote?.responsiblePhone ?? "");
  const [issueDate, setIssueDate] = useState(toDateInputValue(quote?.issueDate ?? new Date()));
  const [expiryDate, setExpiryDate] = useState(
    quote?.expiryDate
      ? toDateInputValue(quote.expiryDate)
      : toDateInputValue(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
  );
  const [shippingFee, setShippingFee] = useState(quote?.shippingFee ?? 0);
  const [discountAmount, setDiscountAmount] = useState(quote?.discountAmount ?? 0);
  const [currency, setCurrency] = useState(quote?.currency ?? "AED");
  const [termsAr, setTermsAr] = useState(quote?.termsAr ?? defaultTerms.ar);
  const [termsEn, setTermsEn] = useState(quote?.termsEn ?? defaultTerms.en);
  const [customerNote, setCustomerNote] = useState(quote?.customerNote ?? "");
  const [items, setItems] = useState<QuoteItemInput[]>(
    quote
      ? quote.items
          .sort((a, b) => a.position - b.position)
          .map((i) => ({
            productId: i.productId,
            descriptionAr: i.descriptionAr,
            descriptionEn: i.descriptionEn,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            customerTypeId: i.customerTypeId,
            discountPercent: i.discountPercent
          }))
      : orderPrefill && orderPrefill.items.length > 0
        ? orderPrefill.items
        : [{ ...emptyItem }]
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setError("تعذر تحميل المنتجات"));
    fetch("/api/admin/customer-types")
      .then((r) => r.json())
      .then((all: CustomerType[]) => setCustomerTypes(all.filter((c) => c.isActive)))
      .catch(() => setError("تعذر تحميل أنواع العملاء"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = quoteInputSchema.safeParse({
      orderId: quote?.orderId ?? orderPrefill?.orderId ?? null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      customerAddress: customerAddress || null,
      customerNumber: customerNumber || null,
      addressedTo: addressedTo || null,
      responsibleName: responsibleName || null,
      responsiblePhone: responsiblePhone || null,
      issueDate,
      expiryDate: expiryDate || null,
      shippingFee,
      discountAmount,
      currency,
      termsAr,
      termsEn,
      customerNote: customerNote || null,
      items
    });

    if (!payload.success) {
      setLoading(false);
      setError("تحقق من الحقول — في بيانات ناقصة أو غير صحيحة.");
      return;
    }

    const url = quote ? `/api/admin/quotes/${quote.id}` : "/api/admin/quotes";
    const method = quote ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ عرض السعر. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/quotes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">بيانات الزبون</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم الزبون</label>
            <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div>
            <label className="label">رقم الهاتف</label>
            <input className="input" dir="ltr" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
          </div>
          <div>
            <label className="label">الإيميل (اختياري)</label>
            <input className="input" dir="ltr" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">رقم الزبون (اختياري)</label>
            <input className="input" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">عنوان الزبون (اختياري)</label>
            <input className="input" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
          <div>
            <label className="label">موجّه العرض إلى (اختياري)</label>
            <input className="input" value={addressedTo} onChange={(e) => setAddressedTo(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">بيانات العرض</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم المسؤول (اختياري)</label>
            <input className="input" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} />
          </div>
          <div>
            <label className="label">هاتف المسؤول (اختياري)</label>
            <input className="input" dir="ltr" value={responsiblePhone} onChange={(e) => setResponsiblePhone(e.target.value)} />
          </div>
          <div>
            <label className="label">تاريخ العرض</label>
            <input className="input" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">تاريخ الانتهاء (اختياري)</label>
            <input className="input" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">المنتجات</h2>
        <QuoteItemsTable items={items} onChange={setItems} products={products} customerTypes={customerTypes} />
      </div>

      <div className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">رسوم الشحن</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={shippingFee}
              onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">خصم إضافي (مبلغ ثابت، بعد المجموع)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">العملة</label>
            <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
        </div>
        <QuoteTotalsSummary items={items} shippingFee={shippingFee} discountAmount={discountAmount} currency={currency} />
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">شروط العرض</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">الشروط (عربي)</label>
            <textarea className="input" rows={14} value={termsAr} onChange={(e) => setTermsAr(e.target.value)} required />
          </div>
          <div>
            <label className="label">Terms (English)</label>
            <textarea className="input" rows={14} value={termsEn} onChange={(e) => setTermsEn(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">ملاحظة للعميل (اختياري)</label>
          <textarea className="input" rows={3} value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ عرض السعر"}
      </button>
    </form>
  );
}
