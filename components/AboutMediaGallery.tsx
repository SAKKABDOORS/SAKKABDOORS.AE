import type { AboutMediaContent } from "@/lib/siteContent";
import { buildYouTubeEmbedUrl, parseYouTubeId } from "@/lib/youtube";

export default function AboutMediaGallery({ items }: { items: AboutMediaContent["items"] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item, i) => {
        if (item.type === "image") {
          return (
            <div key={i} className="overflow-hidden rounded-xl2 bg-brand-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="aspect-video w-full object-cover" />
            </div>
          );
        }

        const youtubeId = parseYouTubeId(item.url);
        return (
          <div key={i} className="overflow-hidden rounded-xl2 bg-brand-900">
            {youtubeId ? (
              <iframe
                src={buildYouTubeEmbedUrl(youtubeId)}
                title=""
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full border-0"
              />
            ) : (
              <video src={item.url} controls playsInline className="aspect-video w-full object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
