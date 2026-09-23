import { NextRequest, NextResponse } from "next/server";
import { runWeeklyReport, runBackupExport } from "@/lib/cronTasks";

export const dynamic = "force-dynamic";

// The one route actually scheduled by vercel.json's weekly Vercel Cron
// job — runs both weekly tasks (the printed inventory/orders report and
// the data-safety backup export) under a single cron-job slot, mirroring
// /api/system/cron/daily-alerts' reasoning (Vercel's Hobby plan caps the
// number of cron jobs per project). Each also has its own standalone route
// (weekly-report, backup) for manual testing, sharing this same logic via
// lib/cronTasks.ts.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const results: { weeklyReport?: unknown; backup?: unknown } = {};
  const errors: string[] = [];

  try {
    results.weeklyReport = await runWeeklyReport();
  } catch (err) {
    console.error("Failed to send weekly report:", err);
    errors.push("weekly_report");
  }

  try {
    results.backup = await runBackupExport();
  } catch (err) {
    console.error("Failed to send backup email:", err);
    errors.push("backup");
  }

  return NextResponse.json({ results, errors }, { status: errors.length > 0 ? 500 : 200 });
}
