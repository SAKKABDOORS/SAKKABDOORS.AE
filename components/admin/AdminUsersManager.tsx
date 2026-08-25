"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/adminRoles";

type AdminRow = { id: string; username: string; role: string; createdAt: string };

export default function AdminUsersManager({
  admins,
  currentAdminId,
  currentRole
}: {
  admins: AdminRow[];
  currentAdminId: string;
  currentRole: AdminRole;
}) {
  return (
    <div className="space-y-6">
      <ChangeMyPassword />
      <AddAdmin />
      <AdminList admins={admins} currentAdminId={currentAdminId} currentRole={currentRole} />
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
    const res = await fetch("/api/admin/users/me", {
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
          <input
            className="input"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="label">تأكيد كلمة المرور</label>
          <input
            className="input"
            type="password"
            dir="ltr"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
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

function AddAdmin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        data?.error === "username_taken"
          ? "اسم المستخدم هذا محجوز، يرجى اختيار اسم آخر."
          : "تعذر إنشاء الحساب. تأكد من أن اسم المستخدم مكوّن من ٣ أحرف إنجليزية على الأقل، وأن كلمة المرور مكوّنة من ٨ أحرف على الأقل."
      );
      return;
    }

    setUsername("");
    setPassword("");
    setRole("EMPLOYEE");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-bold text-ink-900">إضافة حساب جديد</h2>
      <p className="text-sm text-ink-800/60">
        اختر صلاحية الحساب: <strong>مدير</strong> يدخل كل شيء ما عدا محتوى الصفحة الرئيسية، و<strong>موظف</strong>{" "}
        يدخل فقط قسم المنتجات والفئات.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">اسم المستخدم</label>
          <input
            className="input"
            dir="ltr"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            pattern="[a-zA-Z0-9_.-]+"
            minLength={3}
            required
          />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input
            className="input"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      <div>
        <label className="label">الصلاحية</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as "MANAGER" | "EMPLOYEE")}>
          <option value="MANAGER">{ADMIN_ROLE_LABELS.MANAGER}</option>
          <option value="EMPLOYEE">{ADMIN_ROLE_LABELS.EMPLOYEE}</option>
        </select>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "جاري الإضافة..." : "إضافة الحساب"}
      </button>
    </form>
  );
}

function AdminList({
  admins,
  currentAdminId,
  currentRole
}: {
  admins: AdminRow[];
  currentAdminId: string;
  currentRole: AdminRole;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, username: string) {
    if (!confirm(`هل أنت متأكد أنك تريد حذف حساب "${username}"؟`)) return;
    setError(null);
    setBusyId(id);

    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusyId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        data?.error === "last_admin"
          ? "لا يمكنك حذف آخر حساب في الموقع."
          : data?.error === "cannot_delete_super_admin"
            ? "لا يمكن حذف حساب المسؤول."
            : "تعذر حذف الحساب."
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="border-b border-brand-100 bg-brand-50">
          <tr>
            <th className="p-3 text-start font-semibold">اسم المستخدم</th>
            <th className="p-3 text-start font-semibold">الصلاحية</th>
            <th className="p-3 text-start font-semibold">تاريخ الإنشاء</th>
            <th className="p-3 text-start font-semibold"><span className="sr-only">إجراءات</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {admins.map((admin) => {
            const role = admin.role as AdminRole;
            const canDelete = currentRole !== "EMPLOYEE" && admin.id !== currentAdminId && role !== "SUPER_ADMIN";
            return (
              <tr key={admin.id}>
                <td className="p-3 font-medium text-ink-900">
                  {admin.username}
                  {admin.id === currentAdminId && (
                    <span className="ms-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      أنت
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={role === "SUPER_ADMIN" ? "badge-neutral" : "badge-success"}>
                    {ADMIN_ROLE_LABELS[role] ?? role}
                  </span>
                </td>
                <td className="p-3 text-ink-800/70" dir="ltr">
                  {new Date(admin.createdAt).toLocaleDateString("ar-AE")}
                </td>
                <td className="p-3">
                  <div className="flex justify-end">
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={busyId === admin.id}
                        onClick={() => handleDelete(admin.id, admin.username)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {busyId === admin.id ? "..." : "حذف"}
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
