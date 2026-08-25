import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/adminApi";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// SVG is deliberately excluded — it can carry embedded <script>, unlike
// raster formats, and this file is served directly from /public.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif"
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Admin-only image upload (logo, hero background, etc.) — stores the file
// on local disk under public/uploads and returns its public URL. The
// filename is always server-generated (never the client-supplied name) to
// rule out path traversal or extension-spoofing.
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

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
