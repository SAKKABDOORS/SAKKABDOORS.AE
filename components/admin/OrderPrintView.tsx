"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getOrderStatusInfo } from "@/lib/orderStatus";

type OrderPrintData = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string | null;
  city: string | null;
  message: string | null;
  status: string;
  items: { id: string; nameAr: string; quantity: number; measurement: string | null }[];
};

// Opened in its own tab from the orders list ("طباعة مباشرة") instead of
// routing through the email-to-printer flow (ORDER_NOTIFY_EMAIL) — this
// lets the admin pick from whatever printers are actually set up on their
// own computer via the browser's native print dialog.
export default function OrderPrintView({ order }: { order: OrderPrintData }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, []);

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <div className="mx-auto max-w-2xl p-6 print:p-0">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-sm">
          طباعة
        </button>
        <button onClick={() => window.close()} className="btn-secondary py-2 px-4 text-sm">
          إغلاق
        </button>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-8 print:rounded-none print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b-2 border-brand-700 pb-4">
          <div>
            <h1 className="text-lg font-bold text-brand-700">طلب جديد</h1>
            <p className="text-xs text-ink-800/60">#{order.id.slice(-6).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-brand-700">SAKKAB DOORS</span>
            <Image src="/images/logo-mark.png" alt="" width={32} height={32} className="rounded" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field label="التاريخ" value={new Date(order.createdAt).toLocaleString("ar-AE")} />
          <Field label="الحالة" value={statusInfo.label} />
          <Field label="اسم العميل" value={order.customerName} />
          <Field label="الهاتف" value={order.phone} />
          {order.email && <Field label="الإيميل" value={order.email} />}
          {order.city && <Field label="المدينة" value={order.city} />}
        </div>

        {order.message && (
          <div className="mt-4">
            <p className="mb-1 text-sm font-bold text-brand-700">الرسالة</p>
            <p className="whitespace-pre-line text-sm text-ink-900">{order.message}</p>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-brand-700">المنتجات المطلوبة</p>
          {order.items.length === 0 ? (
            <p className="text-sm text-ink-800/60">استفسار عام (بدون منتج محدد)</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-700 text-brand-700">
                  <th className="py-1.5 text-start font-bold">المنتج</th>
                  <th className="py-1.5 text-start font-bold">القياس</th>
                  <th className="py-1.5 text-start font-bold">الكمية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5">{item.nameAr}</td>
                    <td className="py-1.5">{item.measurement ?? "—"}</td>
                    <td className="py-1.5">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-1">
      <span className="shrink-0 font-bold text-brand-700">{label}:</span>
      <span className="min-w-0 break-words text-ink-900">{value}</span>
    </div>
  );
}
