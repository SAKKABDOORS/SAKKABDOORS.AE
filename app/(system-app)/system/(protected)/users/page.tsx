import { prisma } from "@/lib/prisma";
import { requireSystemRole } from "@/lib/requireSystemRole";
import SystemUsersManager from "@/components/SystemUsersManager";

export default async function SystemUsersPage() {
  const session = await requireSystemRole("users");

  const [users, employees] = await Promise.all([
    prisma.systemUser.findMany({
      select: { id: true, email: true, name: true, role: true, employeeId: true, createdAt: true },
      orderBy: { createdAt: "asc" }
    }),
    prisma.employee.findMany({ where: { isActive: true }, select: { id: true, nameAr: true }, orderBy: { nameAr: "asc" } })
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">المستخدمين</h1>
      <SystemUsersManager
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        employees={employees}
        currentUserId={session.sub}
      />
    </div>
  );
}
