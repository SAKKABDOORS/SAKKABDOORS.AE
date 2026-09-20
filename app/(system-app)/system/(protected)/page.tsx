import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import { DEFAULT_SYSTEM_ROLE_PAGES } from "@/lib/systemRoles";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices";

function StatTile({ label, value, tone = "brand" }: { label: string; value: string; tone?: "brand" | "emerald" | "red" }) {
  const toneClass = tone === "emerald" ? "text-emerald-700" : tone === "red" ? "text-red-700" : "text-brand-700";
  return (
    <div className="card p-4">
      <p className="text-sm text-ink-800/60">{label}</p>
      <p className={`mt-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default async function SystemDashboardPage() {
  const session = await requireSystemRole("dashboard");
  // OWNER always sees everything; MANAGER/STAFF are checked against the
  // hardcoded default set (see lib/requireSystemRole.ts) — STAFF isn't
  // given "payments" by default, so the financial tiles stay hidden for
  // that role rather than leaking totals through the dashboard.
  const canSeeFinancials = session.role === "OWNER" || DEFAULT_SYSTEM_ROLE_PAGES.MANAGER.includes("payments") && session.role === "MANAGER";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthPayments, openInvoices, invoicesByCustomer, lowStockProducts, customerCount, employeeCount, quoteCount] =
    await Promise.all([
      canSeeFinancials
        ? prisma.payment.findMany({ where: { createdAt: { gte: monthStart } }, select: { type: true, amount: true } })
        : Promise.resolve([]),
      canSeeFinancials
        ? prisma.invoice.findMany({ where: { status: { not: "PAID" } }, select: { status: true, totalAmount: true, paidAmount: true } })
        : Promise.resolve([]),
      prisma.invoice.findMany({ select: { customerName: true, totalAmount: true } }),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 5 }, inventoryMovements: { some: {} } },
        select: { nameAr: true, stockQuantity: true },
        orderBy: { stockQuantity: "asc" },
        take: 8
      }),
      prisma.customer.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.quote.count()
    ]);

  const monthIncome = monthPayments.filter((p) => p.type === "INCOME").reduce((sum, p) => sum + p.amount, 0);
  const monthExpense = monthPayments.filter((p) => p.type === "EXPENSE").reduce((sum, p) => sum + p.amount, 0);
  const openTotal = openInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const byCustomer = new Map<string, number>();
  for (const inv of invoicesByCustomer) {
    byCustomer.set(inv.customerName, (byCustomer.get(inv.customerName) ?? 0) + inv.totalAmount);
  }
  const topCustomers = [...byCustomer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-ink-800/70">أهلاً {session.email} — النظام الداخلي لشركة سكاب.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="عدد العملاء" value={String(customerCount)} />
        <StatTile label="الموظفين النشطين" value={String(employeeCount)} />
        <StatTile label="عروض الأسعار" value={String(quoteCount)} />
        {canSeeFinancials && <StatTile label="فواتير غير مدفوعة بالكامل" value={String(openInvoices.length)} tone="red" />}
      </div>

      {canSeeFinancials && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="دخل هذا الشهر" value={`${monthIncome.toFixed(2)} AED`} tone="emerald" />
          <StatTile label="مصروف هذا الشهر" value={`${monthExpense.toFixed(2)} AED`} tone="red" />
          <StatTile label="صافي هذا الشهر" value={`${(monthIncome - monthExpense).toFixed(2)} AED`} />
        </div>
      )}

      {canSeeFinancials && openInvoices.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-2 font-bold text-ink-900">مبالغ مستحقة القبض</h2>
          <p className="text-sm text-ink-800/70">
            إجمالي المتبقي على {openInvoices.length} فاتورة غير مدفوعة بالكامل: <span className="font-bold text-red-700">{openTotal.toFixed(2)} AED</span>
          </p>
          <Link href="/invoices" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
            عرض الفواتير →
          </Link>
        </div>
      )}

      {topCustomers.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-ink-900">أكتر العملاء نشاطاً</h2>
          <ul className="divide-y divide-brand-100 text-sm">
            {topCustomers.map(([name, total]) => (
              <li key={name} className="flex items-center justify-between py-2">
                <span>{name}</span>
                <span className="font-semibold text-brand-700">{total.toFixed(2)} AED</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-ink-900">تنبيه: منتجات مخزونها منخفض</h2>
          <ul className="divide-y divide-brand-100 text-sm">
            {lowStockProducts.map((p) => (
              <li key={p.nameAr} className="flex items-center justify-between py-2">
                <span>{p.nameAr}</span>
                <span className="font-semibold text-red-700">{p.stockQuantity}</span>
              </li>
            ))}
          </ul>
          <Link href="/warehouse" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
            عرض المخزن →
          </Link>
        </div>
      )}
    </div>
  );
}
