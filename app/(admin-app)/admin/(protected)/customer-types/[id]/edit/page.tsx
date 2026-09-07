import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerTypeForm from "@/components/CustomerTypeForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function EditCustomerTypePage({ params }: { params: { id: string } }) {
  await requirePageRole("customerTypes");

  const customerType = await prisma.customerType.findUnique({ where: { id: params.id } });

  if (!customerType) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل نوع العميل</h1>
      <CustomerTypeForm customerType={customerType} />
    </div>
  );
}
