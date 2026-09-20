"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SYSTEM_ROLE_LABELS, type SystemRoleValue } from "@/lib/systemRoles";

type UserRow = { id: string; email: string; name: string; role: string; employeeId: string | null; createdAt: string };
type EmployeeOption = { id: string; nameAr: string };

export default function SystemUsersManager({
  users,
  employees,
  currentUserId
}: {
  users: UserRow[];
  employees: EmployeeOption[];
  currentUserId: string;
}) {
  const linkedEmployeeIds = new Set(users.map((u) => u.employeeId).filter(Boolean));

  return (
    <div className="space-y-6">
      <ChangeMyPassword />
      <AddUser employees={employees.filter((e) => !linkedEmployeeIds.has(e.id))} />
      <UserList users={users} employees={employees} currentUserId={currentUserId} />
    </div>
  );
}

function ChangeMyPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (password.length < 8) {
      setError("يجب أن تتكوّن كلمة المرور من ٨ أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/system/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setSaving(false);

    if (!res.ok) {
      setError("تعذر تغيير كلمة المرور. حاول مرة أخرى.");
      return;
    }
    setPassword("");
    setConfirm("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-bold text-ink-900">تغيير كلمة المرور</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">كلمة المرور الجديدة</label>
          <input className="input" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div>
          <label className="label">تأكيد كلمة المرور</label>
          <input className="input" type="password" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-600">تم تغيير كلمة المرور بنجاح.</p>}
      <button type="submit" disabled={saving} className="btn-secondary">
        {saving ? "جاري الحفظ..." : "حفظ كلمة المرور"}
      </button>
    </form>
  );
}

function AddUser({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MANAGER" | "STAFF">("STAFF");
  const [employeeId, setEmployeeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/system/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, role, employeeId: employeeId || undefined })
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        data?.error === "email_taken"
          ? "اسم الدخول هذا محجوز، اختر اسم آخر."
          : data?.error === "employee_already_linked"
            ? "هالموظف عنده حساب مسبقاً."
            : "تعذر إنشاء الحساب. تأكد من الحقول."
      );
      return;
    }

    setEmail("");
    setName("");
    setPassword("");
    setRole("STAFF");
    setEmployeeId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-bold text-ink-900">إضافة حساب جديد</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الاسم</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">اسم الدخول</label>
          <input className="input" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} minLength={1} required />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input className="input" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div>
          <label className="label">الصلاحية</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as "MANAGER" | "STAFF")}>
            <option value="MANAGER">{SYSTEM_ROLE_LABELS.MANAGER}</option>
            <option value="STAFF">{SYSTEM_ROLE_LABELS.STAFF}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">ربط بموظف (اختياري)</label>
          <select className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">— بدون ربط —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nameAr}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "جاري الإضافة..." : "إضافة الحساب"}
      </button>
    </form>
  );
}

function UserList({ users, employees, currentUserId }: { users: UserRow[]; employees: EmployeeOption[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const employeeName = (id: string | null) => employees.find((e) => e.id === id)?.nameAr ?? "—";

  async function handleDelete(id: string, email: string) {
    if (!confirm(`هل أنت متأكد أنك تريد حذف حساب "${email}"؟`)) return;
    setError(null);
    setBusyId(id);

    const res = await fetch(`/api/system/users/${id}`, { method: "DELETE" });
    setBusyId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error === "last_owner" ? "لا يمكنك حذف آخر حساب مالك." : "تعذر حذف الحساب.");
      return;
    }
    router.refresh();
  }

  async function handleResetPassword(id: string) {
    const password = prompt("كلمة المرور الجديدة (٨ أحرف على الأقل):");
    if (!password) return;
    if (password.length < 8) {
      setError("كلمة المرور لازم تكون ٨ أحرف على الأقل.");
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/system/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setBusyId(null);
    if (!res.ok) {
      setError("تعذر تغيير كلمة المرور.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="border-b border-brand-100 bg-brand-50">
          <tr>
            <th className="p-3 text-start font-semibold">الاسم</th>
            <th className="p-3 text-start font-semibold">اسم الدخول</th>
            <th className="p-3 text-start font-semibold">الصلاحية</th>
            <th className="p-3 text-start font-semibold">الموظف المرتبط</th>
            <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {users.map((user) => {
            const role = user.role as SystemRoleValue;
            const canDelete = user.id !== currentUserId && role !== "OWNER";
            return (
              <tr key={user.id}>
                <td className="p-3 font-medium text-ink-900">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ms-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">أنت</span>
                  )}
                </td>
                <td className="p-3 text-ink-800/70" dir="ltr">{user.email}</td>
                <td className="p-3">
                  <span className={role === "OWNER" ? "badge-neutral" : "badge-success"}>
                    {SYSTEM_ROLE_LABELS[role] ?? role}
                  </span>
                </td>
                <td className="p-3 text-ink-800/70">{employeeName(user.employeeId)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleResetPassword(user.id)}
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      إعادة تعيين كلمة المرور
                    </button>
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => handleDelete(user.id, user.email)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === user.id ? "..." : "حذف"}
                      </button>
                    ) : (
                      <span className="text-xs text-ink-800/40">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {error && <p className="p-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
