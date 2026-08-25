import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropertyForm from "@/components/PropertyForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  await requirePageRole("properties");

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { images: true }
  });

  if (!property) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل العقار</h1>
      <PropertyForm property={property} />
    </div>
  );
}
