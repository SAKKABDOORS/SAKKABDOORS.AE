import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { askAssistant, isAiEnabled, type ChatMessage } from "@/lib/ai";

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

  try {
    const reply = await askAssistant(message, history as ChatMessage[], locale);

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
