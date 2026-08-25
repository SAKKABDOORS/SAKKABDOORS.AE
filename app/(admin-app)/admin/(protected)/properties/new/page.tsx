import PropertyForm from "@/components/PropertyForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function NewPropertyPage() {
  await requirePageRole(["SUPER_ADMIN", "MANAGER"]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة عقار</h1>
      <PropertyForm />
    </div>
  );
}
