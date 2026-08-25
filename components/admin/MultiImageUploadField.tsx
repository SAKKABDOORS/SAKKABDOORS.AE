"use client";

import { useState } from "react";

export default function MultiImageUploadField({
  label,
  values,
  onChange
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "upload_failed");
        uploaded.push(data.url);
      } catch {
        setError("تعذر رفع صورة أو أكثر. تأكد إنها PNG/JPG/WEBP/GIF وأصغر من 5MB.");
      }
    }

    if (uploaded.length) onChange([...values, ...uploaded]);
    setUploading(false);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function addManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    onChange([...values, url]);
    setManualUrl("");
  }

  return (
    <div>
      <label className="label">{label}</label>

      {values.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {values.map((url, i) => (
            <div key={url + i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-20 w-20 rounded-lg border border-brand-100 object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                aria-label="إزالة"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm text-ink-800 file:me-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
        />
        <div className="flex gap-2">
          <input
            className="input"
            dir="ltr"
            placeholder="أو حط رابط صورة مباشر (https://...)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addManualUrl();
              }
            }}
          />
          <button type="button" onClick={addManualUrl} className="btn-secondary shrink-0">
            إضافة
          </button>
        </div>
      </div>

      {uploading && <p className="mt-1 text-xs text-ink-800/60">جاري الرفع...</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
