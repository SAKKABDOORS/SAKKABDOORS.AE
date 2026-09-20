import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const evaluations = await prisma.employeeEvaluation.findMany({
    where: { employeeId: params.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(evaluations);
}

const evaluationSchema = z.object({
  score: z.number().int().min(1).max(5),
  notes: z.string().max(1000).optional()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireSystemUser(["OWNER", "MANAGER"]);
  if (response) return response;

  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = evaluationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const evaluation = await prisma.employeeEvaluation.create({
    data: {
      employeeId: employee.id,
      score: parsed.data.score,
      notes: parsed.data.notes || null,
      evaluatedBy: session!.email
    }
  });

  return NextResponse.json(evaluation, { status: 201 });
}
