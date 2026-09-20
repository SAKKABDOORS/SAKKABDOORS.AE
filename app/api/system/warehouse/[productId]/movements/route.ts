import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

export async function GET(_request: NextRequest, { params }: { params: { productId: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const movements = await prisma.inventoryMovement.findMany({
    where: { productId: params.productId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(movements);
}

const movementSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().int(),
  note: z.string().max(300).optional()
});

// IN adds to stockQuantity, OUT subtracts (floored at 0 — can't go
// negative), ADJUSTMENT sets the absolute value directly (quantity here is
// the new total, not a delta).
export async function POST(request: NextRequest, { params }: { params: { productId: string } }) {
  const { response } = await requireSystemUser();
  if (response) return response;

  const product = await prisma.product.findUnique({ where: { id: params.productId } });
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = movementSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, quantity, note } = parsed.data;

  let newStock = product.stockQuantity;
  if (type === "IN") newStock = product.stockQuantity + Math.abs(quantity);
  else if (type === "OUT") newStock = Math.max(0, product.stockQuantity - Math.abs(quantity));
  else newStock = Math.max(0, quantity);

  const [movement] = await prisma.$transaction([
    prisma.inventoryMovement.create({ data: { productId: product.id, type, quantity, note: note || null } }),
    prisma.product.update({ where: { id: product.id }, data: { stockQuantity: newStock } })
  ]);

  return NextResponse.json({ movement, stockQuantity: newStock }, { status: 201 });
}
