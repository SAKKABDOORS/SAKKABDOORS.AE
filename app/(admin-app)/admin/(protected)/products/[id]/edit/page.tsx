import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/ProductForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requirePageRole(["SUPER_ADMIN", "MANAGER", "EMPLOYEE"]);

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, category: true }
  });

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل المنتج</h1>
      <ProductForm product={product} />
    </div>
  );
}
