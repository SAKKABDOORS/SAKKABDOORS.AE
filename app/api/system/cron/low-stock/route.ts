import { NextRequest, NextResponse } from "next/server";
import { checkLowStock } from "@/lib/cronTasks";

export const dynamic = "force-dynamic";

// Callable standalone for manual testing — the scheduled Vercel Cron job in
// vercel.json actually hits /api/system/cron/daily-alerts, which runs this
// same check (via lib/cronTasks.ts) alongside the overdue-invoices and
// quote-expiry checks under one cron-job slot.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const notified = await checkLowStock();
    return NextResponse.json({ notified });
  } catch (err) {
    console.error("Failed to send low-stock alert:", err);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }
}
