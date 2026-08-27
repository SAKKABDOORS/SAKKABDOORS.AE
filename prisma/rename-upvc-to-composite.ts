// One-time script: swap "UPVC" -> "COMPOSITE" in already-stored display
// text (category/product names & descriptions, AI knowledge base) on the
// live database. Text-replace on the CURRENT value (not an overwrite) so
// any edits an admin already made are preserved. The Material enum value
// itself stays "UPVC" — see the comment on it in schema.prisma. Wired into
// package.json's build script for a single deploy, then removed.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function swap(text: string | null): string | null {
  if (!text) return text;
  return text.replace(/UPVC/g, "COMPOSITE");
}

async function main() {
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    const next = {
      nameAr: swap(c.nameAr)!,
      nameEn: swap(c.nameEn)!,
      taglineAr: swap(c.taglineAr),
      taglineEn: swap(c.taglineEn),
      descriptionAr: swap(c.descriptionAr),
      descriptionEn: swap(c.descriptionEn)
    };
    const changed =
      next.nameAr !== c.nameAr ||
      next.nameEn !== c.nameEn ||
      next.taglineAr !== c.taglineAr ||
      next.taglineEn !== c.taglineEn ||
      next.descriptionAr !== c.descriptionAr ||
      next.descriptionEn !== c.descriptionEn;
    if (changed) {
      await prisma.category.update({ where: { id: c.id }, data: next });
      console.log(`Updated category: ${c.slug}`);
    }
  }

  const products = await prisma.product.findMany();
  for (const p of products) {
    const next = {
      nameAr: swap(p.nameAr)!,
      nameEn: swap(p.nameEn)!,
      descriptionAr: swap(p.descriptionAr)!,
      descriptionEn: swap(p.descriptionEn)!
    };
    const changed =
      next.nameAr !== p.nameAr ||
      next.nameEn !== p.nameEn ||
      next.descriptionAr !== p.descriptionAr ||
      next.descriptionEn !== p.descriptionEn;
    if (changed) {
      await prisma.product.update({ where: { id: p.id }, data: next });
      console.log(`Updated product: ${p.slug}`);
    }
  }

  const productImages = await prisma.productImage.findMany();
  for (const img of productImages) {
    const nextAlt = swap(img.alt)!;
    if (nextAlt !== img.alt) {
      await prisma.productImage.update({ where: { id: img.id }, data: { alt: nextAlt } });
      console.log(`Updated product image alt text: ${img.id}`);
    }
  }

  const entries = await prisma.knowledgeEntry.findMany();
  for (const e of entries) {
    const next = { title: swap(e.title)!, content: swap(e.content)! };
    if (next.title !== e.title || next.content !== e.content) {
      await prisma.knowledgeEntry.update({ where: { id: e.id }, data: next });
      console.log(`Updated knowledge entry: ${e.title}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
