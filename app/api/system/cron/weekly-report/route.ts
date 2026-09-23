import { NextRequest, NextResponse } from "next/server";
import { runWeeklyReport } from "@/lib/cronTasks";

export const dynamic = "force-dynamic";

// Callable standalone for manual testing — the scheduled Vercel Cron job in
// vercel.json actually hits /api/system/cron/weekly-tasks, which runs this
// same report (via lib/cronTasks.ts) alongside the data backup under one
// cron-job slot. Prints on the same Brother print-by-email address that
// used to fire on every single new order — see app/api/orders/route.ts,
// which now only sends a WhatsApp alert per order.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const counts = await runWeeklyReport();
    return NextResponse.json({ ok: true, ...counts });
  } catch (err) {
    console.error("Failed to send weekly report:", err);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }
}
