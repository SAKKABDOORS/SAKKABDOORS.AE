import "server-only";
import { prisma } from "@/lib/prisma";

type StockLineItem = { productId?: string | null; quantity: number };

// Deducts warehouse stock for each item that has a real catalog product
// behind it (free-text quote/invoice lines have productId null and are
// skipped) — called when a Quote is converted to an Invoice, a confirmed
// sale. Records a matching InventoryMovement per product, same accounting
// the manual warehouse form uses (app/api/system/warehouse/[productId]/
// movements/route.ts), so the sale shows up in that product's history too.
export async function deductStockForItems(items: StockLineItem[], note: string) {
  for (const item of items) {
    if (!item.productId) continue;
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    const newStock = Math.max(0, product.stockQuantity - item.quantity);
    await prisma.$transaction([
      prisma.inventoryMovement.create({ data: { productId: product.id, type: "OUT", quantity: item.quantity, note } }),
      prisma.product.update({ where: { id: product.id }, data: { stockQuantity: newStock } })
    ]);
  }
}

// Reverses a prior deduction (an Invoice was deleted — the sale didn't
// happen after all) — restores the quantity and clears any low-stock alert
// flag the deduction may have triggered, so a future drop can re-notify
// (same reset rule as a manual restock movement).
export async function restoreStockForItems(items: StockLineItem[], note: string) {
  for (const item of items) {
    if (!item.productId) continue;
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    const newStock = product.stockQuantity + item.quantity;
    const clearsLowStockFlag = newStock > product.lowStockThreshold && product.lowStockNotifiedAt !== null;
    await prisma.$transaction([
      prisma.inventoryMovement.create({ data: { productId: product.id, type: "IN", quantity: item.quantity, note } }),
      prisma.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock, ...(clearsLowStockFlag ? { lowStockNotifiedAt: null } : {}) }
      })
    ]);
  }
}
