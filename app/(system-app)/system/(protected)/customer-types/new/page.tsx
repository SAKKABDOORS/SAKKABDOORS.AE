import { requireSystemRole } from "@/lib/requireSystemRole";
import CustomerTypeForm from "@/components/CustomerTypeForm";

export default async function NewSystemCustomerTypePage() {
  await requireSystemRole("customerTypes");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة نوع عميل</h1>
      <CustomerTypeForm apiBase="/api/system/customer-types" redirectTo="/customer-types" />
    </div>
  );
}
