import { redirect } from "next/navigation";
import { getSystemSession } from "@/lib/systemAuth";
import { isSystemRole, SYSTEM_PAGE_KEYS, DEFAULT_SYSTEM_ROLE_PAGES } from "@/lib/systemRoles";
import SystemSidebar from "@/components/SystemSidebar";

export default async function ProtectedSystemLayout({ children }: { children: React.ReactNode }) {
  const session = await getSystemSession();
  if (!session) {
    redirect("/login");
  }
  const role = isSystemRole(session.role) ? session.role : "STAFF";
  // OWNER sees every module unconditionally; MANAGER/STAFF are filtered by
  // the hardcoded default set (no DB-configurable override yet — see
  // lib/requireSystemRole.ts).
  const allowedPages = role === "OWNER" ? [...SYSTEM_PAGE_KEYS] : DEFAULT_SYSTEM_ROLE_PAGES[role];

  return (
    <div className="flex min-h-screen">
      <SystemSidebar role={role} allowedPages={allowedPages} />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
