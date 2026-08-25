"use client";

import { useState } from "react";
import { ADMIN_ROLE_LABELS, PAGE_KEYS, PAGE_KEY_LABELS, type AdminRole, type PageKey } from "@/lib/adminRoles";

type ConfigurableRole = Exclude<AdminRole, "SUPER_ADMIN">;
const ROLES: ConfigurableRole[] = ["MANAGER", "EMPLOYEE"];
// "permissions" is never assignable — only SUPER_ADMIN can ever change who
// sees what (enforced again server-side in the API route).
const ASSIGNABLE_PAGES = PAGE_KEYS.filter((key) => key !== "permissions");

export default function PermissionsManager({
  initialPermissions
}: {
  initialPermissions: Record<ConfigurableRole, PageKey[]>;
}) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggle(role: ConfigurableRole, page: PageKey) {
    setSaved(false);
    setPermissions((prev) => {
      const current = prev[role];
      const next = current.includes(page) ? current.filter((p) => p !== page) : [...current, page];
      return { ...prev, [role]: next };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/permissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(permissions)
    });

    setSaving(false);

    if (!res.ok) {
      setError("تعذر حفظ الصلاحيات. حاول مرة أخرى.");
      return;
    }
    setSaved(true);
  }

  return (
    <div className="card space-y-6 p-6">
      {ROLES.map((role) => (
        <div key={role}>
          <h2 className="mb-3 font-bold text-ink-900">{ADMIN_ROLE_LABELS[role]}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ASSIGNABLE_PAGES.map((page) => (
              <label
                key={page}
                className="flex items-center gap-2 rounded-lg border border-brand-100 px-3 py-2 text-sm text-ink-800"
              >
                <input
                  type="checkbox"
                  checked={permissions[role].includes(page)}
                  onChange={() => toggle(role, page)}
                />
                {PAGE_KEY_LABELS[page]}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium text-emerald-600">تم حفظ الصلاحيات بنجاح.</p>}

      <button type="button" disabled={saving} onClick={handleSave} className="btn-primary">
        {saving ? "جاري الحفظ..." : "حفظ الصلاحيات"}
      </button>
    </div>
  );
}
