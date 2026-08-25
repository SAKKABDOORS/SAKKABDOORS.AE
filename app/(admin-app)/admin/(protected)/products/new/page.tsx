import ProductForm from "@/components/ProductForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function NewProductPage() {
  await requirePageRole(["SUPER_ADMIN", "MANAGER", "EMPLOYEE"]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة منتج</h1>
      <ProductForm />
    </div>
  );
}
