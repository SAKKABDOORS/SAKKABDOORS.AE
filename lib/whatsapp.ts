import type { NewOrderEmailInput } from "@/lib/mailer";

/**
 * Builds a WhatsApp click-to-chat link. Set NEXT_PUBLIC_WHATSAPP_NUMBER
 * in .env (international format, digits only, e.g. 971500000000).
 */
export function buildWhatsAppLink(message: string, phoneOverride?: string) {
  const phone = phoneOverride ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

// Plain-text counterpart to lib/mailer.ts's buildNewOrderEmailHtml — same
// data, formatted for a WhatsApp message instead of an HTML email.
export function buildNewOrderWhatsAppText(order: NewOrderEmailInput): string {
  const shortId = order.orderId.slice(-6).toUpperCase();
  const lines = [`طلب جديد #${shortId}`, "", `الاسم: ${order.customerName}`, `الهاتف: ${order.phone}`];
  if (order.city) lines.push(`المدينة: ${order.city}`);
  if (order.items.length) {
    lines.push("", "المنتجات:");
    for (const item of order.items) {
      lines.push(`- ${item.name} (${item.quantity})${item.measurement ? ` — ${item.measurement}` : ""}`);
    }
  }
  if (order.message) lines.push("", `الرسالة: ${order.message}`);
  return lines.join("\n");
}

// Sends a WhatsApp message to the shop's own number via CallMeBot
// (api.callmebot.com) — a free personal-notification service: no Meta
// Business account, no phone verification flow on our side. Set up once by
// messaging CallMeBot's own WhatsApp number to get an API key, then set
// CALLMEBOT_PHONE (the number that key was issued for, international
// format, no "+") and CALLMEBOT_APIKEY in the environment. Best-effort only
// — callers should never let a failure here block the request that
// triggered it (mirrors how email notification failures are handled).
export async function sendWhatsAppMessage(text: string) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) {
    throw new Error("CALLMEBOT_PHONE or CALLMEBOT_APIKEY is not set in the environment");
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  const res = await fetch(url, { method: "GET" });
  const body = await res.text();
  // CallMeBot always replies 200 with an HTML status page — a failure (bad
  // apikey, phone not registered, rate limit) shows up in the body text
  // rather than the HTTP status, so it has to be checked explicitly.
  if (!res.ok || !/message queued|message sent/i.test(body)) {
    throw new Error(`CallMeBot request failed: ${body.slice(0, 200)}`);
  }
}
