import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeForm from "@/components/EmployeeForm";
import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function EditSystemEmployeePage({ params }: { params: { id: string } }) {
  await requireSystemRole("employees");

  const employee = await prisma.employee.findUnique({ where: { id: params.id } });
  if (!employee) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">تعديل بيانات الموظف</h1>
      <EmployeeForm employee={employee} />
    </div>
  );
}
