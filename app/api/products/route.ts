import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Public: list products (used by client-side widgets if needed; the
// storefront pages themselves query Prisma directly on the server).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const material = searchParams.get("material") ?? undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(material ? { material: material as never } : {})
    },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generated from the English name — appends -2, -3, ... on collision so
// admins never have to think about slugs (see the "slug" field this
// replaced: it was blocking non-technical staff from adding products).
async function uniqueSlug(base: string): Promise<string> {
  const root = base || "product";
  let candidate = root;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${root}-${n}`;
    n++;
  }
  return candidate;
}

const productSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  categoryId: z.string().min(1),
  material: z.enum(["WPC", "UPVC", "ALUMINUM", "STEEL"]),
  productLine: z
    .enum(["ALUMINUM_SLIM_SYSTEM", "ALUMINUM_DOORS", "ALUMINUM_ECOBOND", "WPC_EXTERNAL", "WPC_CLOSETS"])
    .nullable()
    .optional(),
  price: z.number().positive(),
  currency: z.string().min(1).max(10).default("AED"),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url("يجب أن يكون رابط كامل (https://...) — لا يقبل مسار نسبي مثل /images/..."),
        type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE")
      })
    )
    .default([])
});

// Admin-only: create a product.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { images, ...rest } = parsed.data;
  const slug = await uniqueSlug(slugify(rest.nameEn));

  const product = await prisma.product.create({
    data: {
      ...rest,
      slug,
      images: {
        create: images.map((img, i) => ({ url: img.url, type: img.type, position: i }))
      }
    },
    include: { images: true, category: true }
  });

  return NextResponse.json(product, { status: 201 });
}
