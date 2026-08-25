import { prisma } from "@/lib/prisma";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { requirePageRole } from "@/lib/requirePageRole";

export default async function AdminTeamPage() {
  const session = await requirePageRole("team");
  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">حسابات الإدارة</h1>
      <AdminUsersManager
        admins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        currentAdminId={session.sub}
        currentRole={session.role}
      />
    </div>
  );
}
