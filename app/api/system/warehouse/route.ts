import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";

// Same Product rows the main storefront/catalog already reads — see the
// schema comment on Product.stockQuantity for why this is kept separate
// from the storefront's own `inStock` toggle.
export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const products = await prisma.product.findMany({
    select: { id: true, nameAr: true, nameEn: true, material: true, stockQuantity: true, inStock: true },
    orderBy: { nameAr: "asc" }
  });
  return NextResponse.json(products);
}
