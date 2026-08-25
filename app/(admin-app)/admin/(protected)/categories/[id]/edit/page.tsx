import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/CategoryForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  await requirePageRole("categories");

  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل فئة</h1>
      <CategoryForm category={category} />
    </div>
  );
}
