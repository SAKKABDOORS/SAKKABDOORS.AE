import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isAdminRole, PAGE_KEYS } from "@/lib/adminRoles";
import { getAllowedPages } from "@/lib/rolePermissions";
import AdminSidebar from "@/components/AdminSidebar";

export default async function ProtectedAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const role = isAdminRole(session.role) ? session.role : "EMPLOYEE";
  // SUPER_ADMIN sees every page unconditionally; other roles are filtered by
  // whatever the SUPER_ADMIN has configured in /admin/permissions.
  const allowedPages = role === "SUPER_ADMIN" ? [...PAGE_KEYS] : await getAllowedPages(role);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={role} allowedPages={allowedPages} />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
