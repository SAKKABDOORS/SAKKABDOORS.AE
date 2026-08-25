import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminApi";
import { getAllSiteSettings } from "@/lib/siteContent";

// Admin-only: all six CMS sections at once, used by /admin/content's index
// page. Public pages read individual keys directly via getSiteSetting().
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const settings = await getAllSiteSettings();
  return NextResponse.json(settings);
}
