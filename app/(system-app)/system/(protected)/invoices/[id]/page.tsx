import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import { formatInvoiceNumber, invoiceItemSchema, INVOICE_STATUS_LABELS } from "@/lib/invoices";
import InvoicePaymentForm from "@/components/InvoicePaymentForm";
import DeleteInvoiceButton from "@/components/DeleteInvoiceButton";

export default async function SystemInvoiceDetailPage({ params }: { params: { id: string } }) {
  await requireSystemRole("invoices");

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { createdAt: "desc" } } }
  });
  if (!invoice) notFound();

  const items = invoiceItemSchema.array().parse(invoice.items);
  const remaining = Math.round((invoice.totalAmount - invoice.paidAmount) * 100) / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">فاتورة #{formatInvoiceNumber(invoice.invoiceNumber)}</h1>
        <div className="flex gap-2">
          <a href={`/api/system/invoice-pdf/${invoice.id}`} download className="btn-secondary py-1.5 px-3 text-xs">
            تنزيل PDF
          </a>
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <div className="card space-y-2 p-6">
        <p className="text-sm"><span className="font-bold text-brand-700">الزبون:</span> {invoice.customerName}</p>
        <p className="text-sm"><span className="font-bold text-brand-700">الهاتف:</span> {invoice.customerPhone}</p>
        <p className="text-sm"><span className="font-bold text-brand-700">الحالة:</span> {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS]}</p>
      </div>

      <div className="card overflow-x-auto p-6">
        <h2 className="mb-4 font-bold text-ink-900">الأصناف</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100">
            <tr>
              <th className="p-2 text-start font-semibold">الوصف</th>
              <th className="p-2 text-start font-semibold">الكمية</th>
              <th className="p-2 text-start font-semibold">السعر</th>
              <th className="p-2 text-start font-semibold">المجموع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="p-2">{item.descriptionAr}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.unitPrice.toFixed(2)}</td>
                <td className="p-2 font-semibold">{item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-end text-sm">
          <p>المجموع الجزئي: <span className="font-semibold">{invoice.subtotal.toFixed(2)} AED</span></p>
          <p className="text-base font-bold text-brand-700">الإجمالي: {invoice.totalAmount.toFixed(2)} AED</p>
          <p>المدفوع: <span className="font-semibold text-emerald-700">{invoice.paidAmount.toFixed(2)} AED</span></p>
          <p>المتبقي: <span className="font-semibold text-red-700">{remaining.toFixed(2)} AED</span></p>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-bold text-ink-900">تسجيل دفعة</h2>
        <InvoicePaymentForm invoiceId={invoice.id} remaining={remaining} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-ink-900">سجل الدفعات</h2>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-ink-800/60">لا يوجد دفعات مسجلة بعد</p>
        ) : (
          <ul className="divide-y divide-brand-100 text-sm">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>{new Date(p.createdAt).toLocaleString("ar-AE")} {p.method ? `— ${p.method}` : ""} {p.note ? `— ${p.note}` : ""}</span>
                <span className="font-semibold text-emerald-700">{p.amount.toFixed(2)} AED</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
