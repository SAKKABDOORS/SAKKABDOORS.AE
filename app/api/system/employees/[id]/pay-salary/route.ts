import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { postStandalonePayment } from "@/lib/autoPosting";

const paySchema = z.object({ amount: z.number().positive().optional(), note: z.string().max(500).optional() });

// Records a salary payment (defaults to the employee's monthlyWage, but
// can be overridden for a partial/prorated pay) as an EXPENSE Payment.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = paySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const amount = parsed.data.amount ?? employee.monthlyWage;

  const payment = await prisma.payment.create({
    data: {
      type: "EXPENSE",
      category: "salary",
      amount,
      note: parsed.data.note || `راتب — ${employee.nameAr}`,
      employeeId: employee.id
    }
  });

  // Best-effort — see lib/autoPosting.ts.
  try {
    await postStandalonePayment(payment);
  } catch (err) {
    console.error("Failed to auto-post salary payment to accounting ledger:", err);
  }

  await logAudit(session!.email, "create", "Payment", payment.id, `دفع راتب ${amount.toFixed(2)} — ${employee.nameAr}`);
  return NextResponse.json(payment, { status: 201 });
}
