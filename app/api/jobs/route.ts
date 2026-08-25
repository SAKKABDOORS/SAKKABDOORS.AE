import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Public: list job openings (used by the /careers storefront page's own
// server-side Prisma query too, but exposed here the same way properties are).
export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(jobs);
}

const jobSchema = z.object({
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  locationAr: z.string().min(1),
  locationEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1)
});

// Admin-only: create a job opening.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = jobSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({ data: parsed.data });
  return NextResponse.json(job, { status: 201 });
}
