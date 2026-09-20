import { NextRequest, NextResponse } from "next/server";
import { checkOverdueInvoices, checkLowStock, checkQuoteExpiry } from "@/lib/cronTasks";

export const dynamic = "force-dynamic";

// The one route actually scheduled by vercel.json's daily Vercel Cron job —
// runs all three daily checks (overdue invoices, low stock, expiring
// quotes) under a single cron-job slot, since Vercel's Hobby plan caps the
// number of cron jobs per project. Each check also has its own standalone
// route (app/api/system/cron/{overdue-invoices,low-stock,quote-expiry}) for
// manual testing, sharing this same logic via lib/cronTasks.ts.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const results = { overdueInvoices: 0, lowStock: 0, quoteExpiry: 0 };
  const errors: string[] = [];

  try {
    results.overdueInvoices = await checkOverdueInvoices();
  } catch (err) {
    console.error("Failed to send overdue invoices alert:", err);
    errors.push("overdue_invoices");
  }

  try {
    results.lowStock = await checkLowStock();
  } catch (err) {
    console.error("Failed to send low-stock alert:", err);
    errors.push("low_stock");
  }

  try {
    results.quoteExpiry = await checkQuoteExpiry();
  } catch (err) {
    console.error("Failed to send quote-expiry alert:", err);
    errors.push("quote_expiry");
  }

  return NextResponse.json({ results, errors }, { status: errors.length > 0 ? 500 : 200 });
}
