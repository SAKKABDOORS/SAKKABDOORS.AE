import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { askAssistant, isAiEnabled, ABUSE_FLAG, type ChatMessage } from "@/lib/ai";
import { getDictionary } from "@/lib/i18n/getDictionary";

// Vercel sets this; the first entry is the actual visitor (the rest, if any,
// are intermediate proxies). Anonymous storefront visitors have no session/
// cookie to key off of, so IP is the only identity this can block by.
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
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

  const alreadyBlocked = await prisma.blockedVisitor.findUnique({ where: { ip } });
  if (alreadyBlocked) {
    return NextResponse.json({ reply: dict.chat.blocked });
  }

  try {
    const reply = await askAssistant(message, history as ChatMessage[], locale);

    if (reply.includes(ABUSE_FLAG)) {
      // ip is @unique — a second flagged message from the same visitor
      // before this write lands would otherwise throw on the duplicate key.
      await prisma.blockedVisitor
        .create({ data: { ip, reason: message } })
        .catch((err) => console.error("Failed to record blocked visitor:", err));
      return NextResponse.json({ reply: dict.chat.blocked });
    }

    // Fire-and-forget log write; a logging failure shouldn't break the chat.
    prisma.chatLog
      .create({ data: { question: message, answer: reply, locale } })
      .catch((err) => console.error("Failed to save chat log:", err));

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI assistant error:", err);
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
