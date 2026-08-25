"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/lib/types";

export default function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      titleAr: String(form.get("titleAr") || "").trim(),
      titleEn: String(form.get("titleEn") || "").trim(),
      locationAr: String(form.get("locationAr") || "").trim(),
      locationEn: String(form.get("locationEn") || "").trim(),
      descriptionAr: String(form.get("descriptionAr") || "").trim(),
      descriptionEn: String(form.get("descriptionEn") || "").trim()
    };

    const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
    const method = job ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      setError("تعذر حفظ الوظيفة. تحقق من الحقول وحاول مرة أخرى.");
      return;
    }

    router.push("/admin/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">المسمى الوظيفي (عربي)</label>
          <input className="input" name="titleAr" defaultValue={job?.titleAr} required />
        </div>
        <div>
          <label className="label">Job Title (English)</label>
          <input className="input" name="titleEn" defaultValue={job?.titleEn} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الموقع (عربي)</label>
          <input className="input" name="locationAr" defaultValue={job?.locationAr} placeholder="مثال: أبوظبي" required />
        </div>
        <div>
          <label className="label">Location (English)</label>
          <input className="input" name="locationEn" defaultValue={job?.locationEn} placeholder="e.g. Abu Dhabi" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">الوصف (عربي)</label>
          <textarea className="input" name="descriptionAr" rows={5} defaultValue={job?.descriptionAr} required />
        </div>
        <div>
          <label className="label">Description (English)</label>
          <textarea className="input" name="descriptionEn" rows={5} defaultValue={job?.descriptionEn} required />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
    </form>
  );
}
