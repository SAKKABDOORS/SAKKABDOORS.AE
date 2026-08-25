"use client";

import { useState } from "react";

export default function ImageUploadField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload_failed");
      onChange(data.url);
    } catch {
      setError("تعذر رفع الصورة. تأكد إنها PNG/JPG/WEBP/GIF وأصغر من 5MB.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-brand-100 object-cover" />
        )}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
            className="block w-full text-sm text-ink-800 file:me-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
          <input
            className="input"
            dir="ltr"
            placeholder="أو حط رابط صورة مباشر (https://...)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      {uploading && <p className="mt-1 text-xs text-ink-800/60">جاري الرفع...</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
