import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendNewJobApplicationEmail } from "@/lib/mailer";

const applicationSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  applicantName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  yearsExperience: z.string().min(1).max(200),
  reasonJoining: z.string().min(1).max(2000),
  previousWorkplaces: z.string().max(500).optional(),
  certificates: z.string().max(500).optional(),
  extraMessage: z.string().max(2000).optional()
});

// Kept separate from /api/orders — a job application used to be folded into
// Order.message as one free-text blob, mixing candidates into the same
// admin list/print/email flow as product orders and quote requests. The DB
// write always happens first so no application is ever lost even if the
// email fails; failure is reported back on the record (emailedOk) instead
// of failing the whole request.
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const application = await prisma.jobApplication.create({ data });

  try {
    await sendNewJobApplicationEmail({
      applicationId: application.id,
      createdAt: application.createdAt,
      jobTitle: application.jobTitle,
      applicantName: application.applicantName,
      phone: application.phone,
      yearsExperience: application.yearsExperience,
      reasonJoining: application.reasonJoining,
      previousWorkplaces: application.previousWorkplaces,
      certificates: application.certificates,
      extraMessage: application.extraMessage
    });
    await prisma.jobApplication.update({ where: { id: application.id }, data: { emailedOk: true } });
  } catch (err) {
    console.error("Failed to send job application notification email:", err);
  }

  return NextResponse.json({ id: application.id }, { status: 201 });
}
