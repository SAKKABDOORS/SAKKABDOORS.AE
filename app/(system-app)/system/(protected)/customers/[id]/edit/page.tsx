import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerForm from "@/components/CustomerForm";
import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function EditSystemCustomerPage({ params }: { params: { id: string } }) {
  await requireSystemRole("customers");

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });

  if (!customer) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل العميل</h1>
      <CustomerForm customer={customer} />
    </div>
  );
}
