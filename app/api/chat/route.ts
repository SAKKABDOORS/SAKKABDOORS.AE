import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { askAssistant, isAiEnabled, isMessageAbusive, type ChatMessage } from "@/lib/ai";
import { getDictionary } from "@/lib/i18n/getDictionary";

// Vercel sets this; the first entry is the actual visitor (the rest, if any,
// are intermediate proxies).
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// Anonymous storefront visitors have no login/session, so blocking keys off
// two identifiers instead of just IP: a visitor turning a VPN on mid-chat
// changes their IP but keeps this cookie, so a block still holds.
const VISITOR_COOKIE = "sakkab_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function withVisitorCookie(response: NextResponse, visitorId: string): NextResponse {
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE
  });
  return response;
}

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000)
      })
    )
    .max(20)
    .default([]),
  locale: z.enum(["ar", "en"]).default("ar")
});

export async function POST(request: NextRequest) {
  if (!(await isAiEnabled())) {
    return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
  }

  const json = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { message, history, locale } = parsed.data;
  const dict = await getDictionary(locale);
  const ip = getClientIp(request);
  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value || randomUUID();

  const alreadyBlocked = await prisma.blockedVisitor.findFirst({ where: { OR: [{ ip }, { cookieId: visitorId }] } });
  if (alreadyBlocked) {
    return withVisitorCookie(NextResponse.json({ reply: dict.chat.blocked }), visitorId);
  }

  if (await isMessageAbusive(message)) {
    // cookieId is @unique — a second flagged message from the same visitor
    // before this write lands would otherwise throw on the duplicate key.
    await prisma.blockedVisitor
      .create({ data: { ip, cookieId: visitorId, reason: message } })
      .catch((err) => console.error("Failed to record blocked visitor:", err));
    return withVisitorCookie(NextResponse.json({ reply: dict.chat.blocked }), visitorId);
  }

  try {
    const reply = await askAssistant(message, history as ChatMessage[], locale);

    // Fire-and-forget log write; a logging failure shouldn't break the chat.
    prisma.chatLog
      .create({ data: { question: message, answer: reply, locale } })
      .catch((err) => console.error("Failed to save chat log:", err));

    return withVisitorCookie(NextResponse.json({ reply }), visitorId);
  } catch (err) {
    console.error("AI assistant error:", err);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
