import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { postStandalonePayment } from "@/lib/autoPosting";

// Pays every active employee's full monthlyWage in one go (skips anyone
// with 0, since paying nothing isn't a real payment) — one Payment(EXPENSE,
// category:"salary") row per employee, same as the single "دفع الراتب"
// action on the employee detail page.
export async function POST() {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const employees = await prisma.employee.findMany({
    where: { isActive: true, monthlyWage: { gt: 0 } },
    select: { id: true, nameAr: true, monthlyWage: true }
  });

  if (employees.length === 0) {
    return NextResponse.json({ paidCount: 0, totalAmount: 0 });
  }

  await prisma.payment.createMany({
    data: employees.map((e) => ({
      type: "EXPENSE" as const,
      category: "salary",
      amount: e.monthlyWage,
      note: `راتب — ${e.nameAr}`,
      employeeId: e.id
    }))
  });

  const totalAmount = employees.reduce((sum, e) => sum + e.monthlyWage, 0);

  // Best-effort, one combined entry for the whole batch rather than one per
  // employee (createMany doesn't return individual row ids to post
  // separately against) — see lib/autoPosting.ts.
  try {
    await postStandalonePayment({
      id: `bulk-${Date.now()}`,
      type: "EXPENSE",
      category: "salary",
      amount: totalAmount,
      note: `دفع رواتب جماعي — ${employees.length} موظف`
    });
  } catch (err) {
    console.error("Failed to auto-post bulk salary payment to accounting ledger:", err);
  }

  await logAudit(session!.email, "create", "Payment", "bulk", `دفع رواتب جماعي: ${employees.length} موظف، إجمالي ${totalAmount.toFixed(2)}`);
  return NextResponse.json({ paidCount: employees.length, totalAmount });
}
