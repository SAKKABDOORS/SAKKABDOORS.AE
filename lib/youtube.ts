// Extracts the video id from any common YouTube URL shape
// (watch?v=, youtu.be/, /embed/, /shorts/) — returns null for anything else
// (including plain MP4 links), so callers can fall back to a normal <video>.
export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) return null;

    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.pathname === "/watch") {
      return u.searchParams.get("v");
    }
    const embedMatch = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
    if (embedMatch) return embedMatch[2];

    return null;
  } catch {
    return null;
  }
}

// Normal, user-controlled embed (sound on, no autoplay/loop) — for a
// regular gallery/content video, as opposed to a muted looping background.
export function buildYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function buildYouTubeBackgroundEmbedUrl(videoId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    showinfo: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0"
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
