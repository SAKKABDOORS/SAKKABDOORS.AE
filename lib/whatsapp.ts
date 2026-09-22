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

// Sends a WhatsApp message via Green API (greenapi.com — NOT green-api.com;
// that hyphenated host doesn't resolve reliably and silently breaks
// delivery) — a free-tier WhatsApp gateway: the shop's own number is linked
// once (scanning a QR code, like WhatsApp Web) rather than needing a Meta
// Business account. Set GREEN_API_INSTANCE_ID + GREEN_API_TOKEN (from the
// instance's dashboard) and GREEN_API_NOTIFY_CHAT_ID (the destination —
// "<phone>@c.us" for a person or "<id>@g.us" for a group, both obtainable
// from the instance's getChats endpoint) in the environment. Best-effort
// only — callers should never let a failure here block the request that
// triggered it (mirrors how email notification failures are handled).
// Requires the linked phone to stay online/connected, unlike CallMeBot —
// see buildWhatsAppLink above for the unrelated storefront click-to-chat
// button, which doesn't depend on either of these.
export async function sendWhatsAppMessage(text: string) {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;
  const chatId = process.env.GREEN_API_NOTIFY_CHAT_ID;
  if (!instanceId || !token || !chatId) {
    throw new Error("GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, or GREEN_API_NOTIFY_CHAT_ID is not set in the environment");
  }

  const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message: text })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Green API request failed (${res.status}): ${body.slice(0, 200)}`);
  }
}
