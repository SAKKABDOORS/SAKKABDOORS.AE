"use client";

import { useState } from "react";

type GalleryImage = { url: string; alt: string };

export default function ProductGallery({
  images,
  fallbackAlt
}: {
  images: GalleryImage[];
  fallbackAlt: string;
}) {
  const shown = images.length > 0 ? images : [{ url: "/images/placeholder-door.svg", alt: fallbackAlt }];
  const [active, setActive] = useState(0);
  const current = shown[Math.min(active, shown.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-xl2 bg-brand-100">
        <img src={current.url} alt={current.alt || fallbackAlt} className="h-full w-full object-cover" />
      </div>

      {shown.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {shown.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
