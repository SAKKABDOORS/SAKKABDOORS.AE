import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";

const updateSchema = z.object({ lowStockThreshold: z.number().int().min(0) });

// The only warehouse-side field editable here — stockQuantity only ever
// changes through a movement (see ./movements/route.ts), never directly.
export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: params.productId },
    data: {
      lowStockThreshold: parsed.data.lowStockThreshold,
      // A higher threshold can turn an already-fine stock level into a
      // newly-"low" one — clear the flag so the daily cron re-evaluates it
      // fresh instead of staying silent under the old threshold's alert.
      lowStockNotifiedAt: null
    }
  });

  await logAudit(session!.email, "update", "Product", product.id, `تعديل حد التنبيه للمخزون: ${product.nameAr} → ${product.lowStockThreshold}`);
  return NextResponse.json(product);
}
