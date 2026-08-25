/**
 * Builds a WhatsApp click-to-chat link. Set NEXT_PUBLIC_WHATSAPP_NUMBER
 * in .env (international format, digits only, e.g. 971500000000).
 */
export function buildWhatsAppLink(message: string, phoneOverride?: string) {
  const phone = phoneOverride ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}
