import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/siteContent";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Everything the assistant is allowed to know: live site facts (branches,
 * phone numbers, email — read from the same SiteSetting the admin edits in
 * /admin/content, so this can never drift out of sync the way a hardcoded
 * copy would) + whatever the admin has added in /admin/ai (the "training"
 * data) + a capped slice of the live product catalog. There's no
 * fine-tuning, the admin just edits KnowledgeEntry rows and site content.
 */
async function buildSystemPrompt(locale: string) {
  const [entries, products, footer] = await Promise.all([
    prisma.knowledgeEntry.findMany({ where: { isActive: true }, orderBy: { updatedAt: "desc" }, take: 30 }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 40
    }),
    getSiteSetting("footer")
  ]);

  const siteFacts = [
    "SAKKAB Group — real estate development, aluminum works, and doors (WPC, COMPOSITE, Aluminum).",
    `Locations: ${footer.locations.map((loc) => `${loc.name.en} (${loc.address.en})`).join(", ")}.`,
    `Contact: ${footer.email}, ${footer.locations.map((loc) => `+${loc.phone}`).join(", ")}.`
  ].join("\n");

  const knowledgeText = entries.length
    ? entries.map((e) => `- [${e.category}] ${e.title}: ${e.content}`).join("\n")
    : "(no extra knowledge entries yet)";

  const productsText = products.length
    ? products
        .map(
          (p) =>
            `- ${p.nameEn} / ${p.nameAr} | category: ${p.category.nameEn} | material: ${p.material} | price: ${p.price} ${p.currency} | ${p.inStock ? "in stock" : "out of stock"}`
        )
        .join("\n")
    : "(no products in the catalog yet)";

  const languageInstruction =
    locale === "ar"
      ? "Reply in colloquial, friendly Arabic unless the visitor writes in English."
      : "Reply in English unless the visitor writes in Arabic — then switch to Arabic.";

  return `You are the SAKKAB Doors website assistant. You help visitors with questions about SAKKAB's products (WPC, COMPOSITE and Aluminum doors) and services.

Rules:
- Only answer using the SITE FACTS, KNOWLEDGE BASE and PRODUCT CATALOG below. If you don't know something, say so honestly and suggest contacting the team on WhatsApp instead of guessing.
- Never invent prices, warranty terms, or delivery times that aren't listed below.
- Keep answers short and friendly (2-4 sentences), like a helpful sales assistant.
- Plain text only — no markdown (no **bold**, no bullet lists, no headings). This is rendered as-is in a chat bubble.
- ${languageInstruction}

SITE FACTS:
${siteFacts}

KNOWLEDGE BASE (maintained by the SAKKAB team):
${knowledgeText}

PRODUCT CATALOG (subset):
${productsText}`;
}

async function callAnthropic(system: string, history: ChatMessage[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-3-5-haiku-20241022",
      max_tokens: 400,
      system,
      messages: history.map((m) => ({ role: m.role, content: m.content }))
    })
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (data.content?.[0]?.text as string) ?? "";
}

async function callGemini(system: string, history: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = process.env.AI_MODEL || "gemini-3.6-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        // Gemini's "thinking" tokens count against maxOutputTokens too, so
        // this needs real headroom above the ~400 the other providers use
        // or replies get cut off mid-sentence before any visible text comes out.
        generationConfig: { maxOutputTokens: 1024 }
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text as string) ?? "";
}

async function callOpenAI(system: string, history: ChatMessage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      max_tokens: 400,
      messages: [{ role: "system", content: system }, ...history]
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string) ?? "";
}

const PROVIDERS = ["anthropic", "openai", "gemini"] as const;

export async function isAiEnabled() {
  const provider = process.env.AI_PROVIDER;
  return (PROVIDERS as readonly string[]).includes(provider ?? "");
}

/**
 * Main entry point used by /api/chat. Returns a reply string, or throws if
 * the provider call fails (the route handler turns that into a friendly
 * fallback message so the widget never shows a raw error).
 */
export async function askAssistant(message: string, history: ChatMessage[], locale: string) {
  const provider = process.env.AI_PROVIDER;
  if (!(PROVIDERS as readonly string[]).includes(provider ?? "")) {
    throw new Error("AI_PROVIDER is not configured (set it to 'anthropic', 'openai', or 'gemini' in .env)");
  }

  const system = await buildSystemPrompt(locale);
  const fullHistory: ChatMessage[] = [...history, { role: "user", content: message }];

  const reply =
    provider === "anthropic"
      ? await callAnthropic(system, fullHistory)
      : provider === "gemini"
        ? await callGemini(system, fullHistory)
        : await callOpenAI(system, fullHistory);

  return reply.trim();
}
