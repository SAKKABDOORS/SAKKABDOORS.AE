import { requireAccountingRole } from "@/lib/requireAccountingRole";
import AccountingSidebar from "@/components/AccountingSidebar";

export default async function ProtectedAccountingLayout({ children }: { children: React.ReactNode }) {
  await requireAccountingRole();

  return (
    <div className="flex min-h-screen">
      <AccountingSidebar />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
