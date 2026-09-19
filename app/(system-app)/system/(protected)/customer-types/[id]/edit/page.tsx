import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerTypeForm from "@/components/CustomerTypeForm";
import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function EditSystemCustomerTypePage({ params }: { params: { id: string } }) {
  await requireSystemRole("customerTypes");

  const customerType = await prisma.customerType.findUnique({ where: { id: params.id } });

  if (!customerType) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل نوع العميل</h1>
      <CustomerTypeForm customerType={customerType} apiBase="/api/system/customer-types" redirectTo="/customer-types" />
    </div>
  );
}
