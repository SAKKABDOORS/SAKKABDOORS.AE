"use client";

import { useState } from "react";
import type { AboutMediaContent } from "@/lib/siteContent";

type Item = AboutMediaContent["items"][number];

export default function AboutMediaEditor({
  value,
  onChange
}: {
  value: AboutMediaContent;
  onChange: (v: AboutMediaContent) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [draftVideoUrl, setDraftVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, patch: Partial<Item>) {
    const items = [...value.items];
    items[index] = { ...items[index], ...patch };
    onChange({ items });
  }

  function removeItem(index: number) {
    onChange({ items: value.items.filter((_, i) => i !== index) });
  }

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);

    const uploaded: Item[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "upload_failed");
        uploaded.push({ type: "image", url: data.url, title: "", description: "" });
      } catch {
        setError("تعذر رفع صورة أو أكثر. تأكد إنها PNG/JPG/WEBP/GIF وأصغر من 5MB.");
      }
    }

    if (uploaded.length) onChange({ items: [...value.items, ...uploaded] });
    setUploading(false);
  }

  function addVideo() {
    const url = draftVideoUrl.trim();
    if (!url) return;
    onChange({ items: [...value.items, { type: "video", url, title: "", description: "" }] });
    setDraftVideoUrl("");
  }

  return (
    <div className="space-y-4">
      {value.items.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-brand-100 p-3 sm:flex-row">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-100">
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-ink-900 text-xs text-white">فيديو</div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {item.type === "video" && (
              <input
                className="input"
                dir="ltr"
                value={item.url}
                onChange={(e) => updateItem(i, { url: e.target.value })}
              />
            )}
            <input
              className="input"
              placeholder="عنوان (اختياري)"
              value={item.title}
              onChange={(e) => updateItem(i, { title: e.target.value })}
            />
            <textarea
              className="input"
              rows={2}
              placeholder="وصف (اختياري)"
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 self-start text-xs font-semibold text-red-600 hover:text-red-700"
          >
            حذف
          </button>
        </div>
      ))}

      <div className="space-y-3 rounded-lg border border-dashed border-brand-200 p-3">
        <div>
          <label className="label">إضافة صور</label>
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
          {uploading && <p className="mt-1 text-xs text-ink-800/60">جاري الرفع...</p>}
        </div>

        <div>
          <label className="label">إضافة فيديو (رابط يوتيوب أو رابط MP4 مباشر)</label>
          <div className="flex gap-2">
            <input
              className="input"
              dir="ltr"
              placeholder="https://youtube.com/watch?v=... أو https://.../video.mp4"
              value={draftVideoUrl}
              onChange={(e) => setDraftVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVideo();
                }
              }}
            />
            <button type="button" onClick={addVideo} className="btn-secondary shrink-0">
              إضافة
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
