/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow product images hosted on any domain during development.
    // In production, replace with the exact CDN/domain you use.
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  eslint: {
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
