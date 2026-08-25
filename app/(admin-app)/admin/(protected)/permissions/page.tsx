import { requirePageRole } from "@/lib/requirePageRole";
import { getAllRolePermissions } from "@/lib/rolePermissions";
import PermissionsManager from "@/components/admin/PermissionsManager";

export default async function AdminPermissionsPage() {
  await requirePageRole("permissions");
  const permissions = await getAllRolePermissions();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-ink-900">الصلاحيات</h1>
      <p className="mb-6 text-sm text-ink-800/70">
        حدّد الصفحات يلي بيقدر يشوفها كل من المدير والموظف. المسؤول (أنت) بيشوف كل شي دايماً بغض النظر عن هالإعدادات.
      </p>
      <PermissionsManager initialPermissions={permissions} />
    </div>
  );
}
