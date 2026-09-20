import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBackupEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

// Triggered weekly by the Vercel Cron job in vercel.json — an extra,
// independently-held JSON snapshot of the tables that actually matter
// day-to-day, mailed as an attachment. Not a substitute for Neon's own
// database backups (this DB already has those), just a second copy DARKSHAM
// holds himself.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const [customers, quotes, invoices, payments, employees] = await Promise.all([
    prisma.customer.findMany(),
    prisma.quote.findMany({ include: { items: true } }),
    prisma.invoice.findMany(),
    prisma.payment.findMany(),
    prisma.employee.findMany()
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    customers,
    quotes,
    invoices,
    payments,
    employees
  };

  const filename = `sakkab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const jsonContent = JSON.stringify(snapshot, null, 2);

  try {
    await sendBackupEmail(filename, jsonContent);
  } catch (err) {
    console.error("Failed to send backup email:", err);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    counts: {
      customers: customers.length,
      quotes: quotes.length,
      invoices: invoices.length,
      payments: payments.length,
      employees: employees.length
    }
  });
}
