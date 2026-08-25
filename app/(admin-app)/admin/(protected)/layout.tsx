import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/adminRoles";
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={role} />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
