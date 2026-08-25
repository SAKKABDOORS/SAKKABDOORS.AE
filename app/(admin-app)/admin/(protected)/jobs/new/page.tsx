import JobForm from "@/components/JobForm";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function NewJobPage() {
  await requirePageRole(["SUPER_ADMIN", "MANAGER"]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة وظيفة</h1>
      <JobForm />
    </div>
  );
}
