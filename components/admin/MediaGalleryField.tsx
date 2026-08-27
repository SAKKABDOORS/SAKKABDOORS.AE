"use client";

import { useState } from "react";
import MultiImageUploadField from "./MultiImageUploadField";

export type MediaItem = { type: "image" | "video"; url: string };

// Shared "photos (upload) + videos (URL)" editor — used by the About page
// media gallery and the product catalog. Video is a pasted URL (YouTube or
// a direct video file) rather than an upload: Vercel's serverless routes
// cap request bodies at ~4.5MB, too small for real video files.
export default function MediaGalleryField({
  imagesLabel,
  videosLabel,
  items,
  onChange
}: {
  imagesLabel: string;
  videosLabel: string;
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}) {
  const [draftVideoUrl, setDraftVideoUrl] = useState("");
  const images = items.filter((item) => item.type === "image").map((item) => item.url);
  const videos = items.filter((item) => item.type === "video").map((item) => item.url);

  function setImages(urls: string[]) {
    onChange([
      ...urls.map((url) => ({ type: "image" as const, url })),
      ...videos.map((url) => ({ type: "video" as const, url }))
    ]);
  }

  function setVideos(urls: string[]) {
    onChange([
      ...images.map((url) => ({ type: "image" as const, url })),
      ...urls.map((url) => ({ type: "video" as const, url }))
    ]);
  }

  function addVideo() {
    const url = draftVideoUrl.trim();
    if (!url) return;
    setVideos([...videos, url]);
    setDraftVideoUrl("");
  }

  return (
    <div className="space-y-6">
      <MultiImageUploadField label={imagesLabel} values={images} onChange={setImages} />

      <div>
        <div className="mb-2 text-sm font-semibold text-ink-800/70">{videosLabel}</div>

        {videos.length > 0 && (
          <ul className="mb-3 space-y-2">
            {videos.map((url, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-brand-100 px-3 py-2 text-sm">
                <span className="flex-1 truncate text-ink-800/80" dir="ltr">{url}</span>
                <button
                  type="button"
                  onClick={() => setVideos(videos.filter((_, j) => j !== i))}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}

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
  );
}
