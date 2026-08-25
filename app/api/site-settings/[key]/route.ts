import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";
import { SITE_SETTING_SCHEMAS, getSiteSetting, type SiteSettingKey } from "@/lib/siteContent";

function isSiteSettingKey(key: string): key is SiteSettingKey {
  return key in SITE_SETTING_SCHEMAS;
}

export async function GET(_request: NextRequest, { params }: { params: { key: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  if (!isSiteSettingKey(params.key)) {
    return NextResponse.json({ error: "unknown_key" }, { status: 404 });
  }
  const value = await getSiteSetting(params.key);
  return NextResponse.json(value);
}

export async function PATCH(request: NextRequest, { params }: { params: { key: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  if (!isSiteSettingKey(params.key)) {
    return NextResponse.json({ error: "unknown_key" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const schema = SITE_SETTING_SCHEMAS[params.key];
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const value = JSON.stringify(parsed.data);
  await prisma.siteSetting.upsert({
    where: { key: params.key },
    update: { value },
    create: { key: params.key, value }
  });

  return NextResponse.json(parsed.data);
}
