import { requirePageRole } from "@/lib/requirePageRole";
import CustomerTypeForm from "@/components/CustomerTypeForm";

export default async function NewCustomerTypePage() {
  await requirePageRole("customerTypes");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة نوع عميل</h1>
      <CustomerTypeForm />
    </div>
  );
}
