import { requireSystemRole } from "@/lib/requireSystemRole";
import EmployeeForm from "@/components/EmployeeForm";

export default async function NewSystemEmployeePage() {
  await requireSystemRole("employees");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">إضافة موظف</h1>
      <EmployeeForm />
    </div>
  );
}
