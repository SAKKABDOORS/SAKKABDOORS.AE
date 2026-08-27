"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { buildYouTubeEmbedUrl, parseYouTubeId } from "@/lib/youtube";

type GalleryImage = { url: string; alt: string; type?: "image" | "video" };

export default function ProductGallery({
  images,
  fallbackAlt
}: {
  images: GalleryImage[];
  fallbackAlt: string;
}) {
  const shown = images.length > 0 ? images : [{ url: "/images/placeholder-door.svg", alt: fallbackAlt, type: "image" as const }];
  const [active, setActive] = useState(0);
  const current = shown[Math.min(active, shown.length - 1)];
  const youtubeId = current.type === "video" ? parseYouTubeId(current.url) : null;

  return (
    <div>
      <div className="overflow-hidden rounded-xl2 bg-brand-100">
        {current.type === "video" ? (
          youtubeId ? (
            <iframe
              src={buildYouTubeEmbedUrl(youtubeId)}
              title=""
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-square w-full border-0 sm:aspect-[4/3]"
            />
          ) : (
            <video src={current.url} controls playsInline className="aspect-square w-full object-cover sm:aspect-[4/3]" />
          )
        ) : (
          <img src={current.url} alt={current.alt || fallbackAlt} className="h-full w-full object-cover" />
        )}
      </div>

      {shown.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {shown.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {img.type === "video" ? (
                <span className="flex h-full w-full items-center justify-center bg-ink-900">
                  <Play className="h-5 w-5 text-white" fill="currentColor" />
                </span>
              ) : (
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
