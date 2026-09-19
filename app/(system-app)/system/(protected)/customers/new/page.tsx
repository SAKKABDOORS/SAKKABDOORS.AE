import { requireSystemRole } from "@/lib/requireSystemRole";
import CustomerForm from "@/components/CustomerForm";

export default async function NewSystemCustomerPage() {
  await requireSystemRole("customers");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة عميل</h1>
      <CustomerForm />
    </div>
  );
}
