import { requireSystemRole } from "@/lib/requireSystemRole";

export default async function SystemDashboardPage() {
  const session = await requireSystemRole("dashboard");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">لوحة التحكم</h1>
      <p className="text-sm text-ink-800/70">أهلاً {session.email} — النظام الداخلي لشركة سكاب.</p>
    </div>
  );
}
