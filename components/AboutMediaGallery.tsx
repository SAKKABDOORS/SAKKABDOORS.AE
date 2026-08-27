import type { AboutMediaContent } from "@/lib/siteContent";
import { buildYouTubeEmbedUrl, parseYouTubeId } from "@/lib/youtube";

export default function AboutMediaGallery({ items }: { items: AboutMediaContent["items"] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map((item, i) => {
        const caption = (item.title || item.description) && (
          <div className="mt-2">
            {item.title && <div className="font-semibold text-ink-900">{item.title}</div>}
            {item.description && <p className="mt-0.5 text-sm text-ink-800/70">{item.description}</p>}
          </div>
        );

        if (item.type === "image") {
          return (
            <div key={i}>
              <div className="overflow-hidden rounded-xl2 bg-brand-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.title} className="aspect-video w-full object-cover" />
              </div>
              {caption}
            </div>
          );
        }

        const youtubeId = parseYouTubeId(item.url);
        return (
          <div key={i}>
            <div className="overflow-hidden rounded-xl2 bg-brand-900">
              {youtubeId ? (
                <iframe
                  src={buildYouTubeEmbedUrl(youtubeId)}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full border-0"
                />
              ) : (
                <video src={item.url} controls playsInline className="aspect-video w-full object-cover" />
              )}
            </div>
            {caption}
          </div>
        );
      })}
    </div>
  );
}
