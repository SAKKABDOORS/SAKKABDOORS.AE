import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/adminApi";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// SVG is deliberately excluded — it can carry embedded <script>, unlike
// raster formats, and this is served back to visitors' browsers directly.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
};

// Admin-only image upload (logo, hero background, product/property photos,
// etc.) — stored in Vercel Blob (BLOB_READ_WRITE_TOKEN, added automatically
// once the Blob store is connected from the Vercel dashboard) and returns
// its public URL. A local-disk write here would fail on Vercel: serverless
// functions run on an ephemeral, read-only filesystem, so anything written
// to public/ at runtime never persists or gets served. The filename is
// always server-generated (never the client-supplied name) to rule out
// path traversal or extension-spoofing.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  // The Blob store can authenticate either via a static BLOB_READ_WRITE_TOKEN
  // or, with newer stores created from the dashboard, via OIDC using
  // BLOB_STORE_ID + the ambient VERCEL_OIDC_TOKEN — either is fine.
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });
  }

  const filename = `${randomUUID()}.${ext}`;
  const blob = await put(filename, file, { access: "public", contentType: file.type });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
