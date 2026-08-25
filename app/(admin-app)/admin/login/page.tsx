"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password")
      })
    });

    setLoading(false);

    if (!res.ok) {
      setError("بيانات الدخول غير صحيحة");
      return;
    }

    const data = await res.json().catch(() => null);
    router.push(data?.redirectTo || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-8 shadow-xl">
        <div className="mb-2 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl2 bg-brand-700">
            <img src="/images/logo-mark.png" alt="" className="h-full w-full object-cover" />
          </span>
          <div className="text-center">
            <h1 className="text-xl font-bold text-ink-900">تسجيل دخول الإدارة</h1>
            <p className="mt-1 text-sm text-ink-800/60">SAKKAB DOORS</p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="username">اسم المستخدم</label>
          <input className="input" id="username" name="username" required autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="password">كلمة المرور</label>
          <input className="input" id="password" name="password" type="password" required />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
