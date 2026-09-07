import nodemailer from "nodemailer";

export type NewOrderEmailInput = {
  orderId: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  message?: string | null;
  items: { name: string; quantity: number }[];
};

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env"
    );
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: SMTP_SECURE === "true",
    // Only matters when secure=false (STARTTLS submission ports like 587) —
    // forces the upgrade to succeed instead of silently falling back to a
    // plaintext session if the server doesn't advertise STARTTLS.
    requireTLS: SMTP_SECURE !== "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Nodemailer's default connection/socket timeouts are ~2 minutes each —
    // with misconfigured or placeholder SMTP settings that leaves a visitor
    // stuck on "submitting" for minutes on every inquiry. The order is
    // already saved before this runs (see app/api/orders/route.ts), so
    // failing fast here just makes that wait bounded instead of silent.
    connectionTimeout: 8000,
    socketTimeout: 8000
  });
}

const BRAND = "#2b503a";
const BRAND_LIGHT = "#d6e0d5";
const INK = "#1b1b18";
const INK_MUTED = "#5b5850";
const LOGO_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae"}/images/logo-mark.png`;

/**
 * Sends a new-order notification automatically to the store inbox
 * (ORDER_NOTIFY_EMAIL — currently a Brother "print by email" address, so
 * this HTML doubles as the order's printed copy). Styled to match the admin
 * panel's own print view (components/admin/OrderPrintView.tsx) — same
 * branding/colors/layout, just built with tables + inline styles since
 * email clients don't run Tailwind or support flexbox/grid reliably.
 * Called right after an order/inquiry is written to the database in
 * app/api/orders/route.ts.
 */
export async function sendNewOrderEmail(order: NewOrderEmailInput) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL ?? process.env.SMTP_USER;
  if (!to) {
    throw new Error("ORDER_NOTIFY_EMAIL is not set in the environment");
  }

  const transport = getTransport();
  const shortId = order.orderId.slice(-6).toUpperCase();
  const subject = `طلب جديد #${shortId} — ${order.customerName}`;
  const html = buildNewOrderEmailHtml(order);

  await transport.sendMail({ from, to, subject, html });
}

// Split out from sendNewOrderEmail() so the markup can be rendered/previewed
// without an SMTP connection.
export function buildNewOrderEmailHtml(order: NewOrderEmailInput) {
  const shortId = order.orderId.slice(-6).toUpperCase();

  const rows = [
    ["التاريخ", order.createdAt.toLocaleString("ar-AE")],
    ["اسم العميل", order.customerName],
    ["الهاتف", order.phone],
    order.email ? ["الإيميل", order.email] : null,
    order.city ? ["المدينة", order.city] : null
  ].filter((r): r is [string, string] => r !== null);

  const html = `
  <div dir="rtl" style="background:#f5f3ee; padding:24px 12px; font-family:Tahoma, Arial, sans-serif;">
    <table role="presentation" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-collapse:collapse;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:24px 28px; border-bottom:2px solid ${BRAND};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:18px; font-weight:bold; color:${BRAND};">
                طلب جديد
                <div style="font-size:12px; font-weight:normal; color:${INK_MUTED}; margin-top:2px;">#${shortId}</div>
              </td>
              <td align="left" style="white-space:nowrap;">
                <img src="${LOGO_URL}" width="28" height="28" alt="" style="vertical-align:middle; border-radius:6px;" />
                <span style="font-size:15px; font-weight:bold; color:${BRAND}; vertical-align:middle;">SAKKAB DOORS</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${rows
              .map(
                ([label, value]) => `
              <tr>
                <td style="padding:4px 0; font-weight:bold; color:${BRAND}; white-space:nowrap;">${label}:</td>
                <td style="padding:4px 0 4px 8px; color:${INK};">${escapeHtml(value)}</td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>
      ${
        order.message
          ? `<tr>
              <td style="padding:16px 28px 0;">
                <div style="font-size:14px; font-weight:bold; color:${BRAND}; margin-bottom:4px;">الرسالة</div>
                <div style="font-size:14px; color:${INK}; white-space:pre-line;">${escapeHtml(order.message)}</div>
              </td>
            </tr>`
          : ""
      }
      <tr>
        <td style="padding:20px 28px 28px;">
          <div style="font-size:14px; font-weight:bold; color:${BRAND}; margin-bottom:8px;">المنتجات المطلوبة</div>
          ${
            order.items.length
              ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; border-collapse:collapse;">
                  <tr style="border-bottom:1px solid ${BRAND};">
                    <th align="right" style="padding:6px 0; color:${BRAND};">المنتج</th>
                    <th align="right" style="padding:6px 0; color:${BRAND};">الكمية</th>
                  </tr>
                  ${order.items
                    .map(
                      (item, i) => `
                    <tr style="${i > 0 ? `border-top:1px solid ${BRAND_LIGHT};` : ""}">
                      <td style="padding:6px 0; color:${INK};">${escapeHtml(item.name)}</td>
                      <td style="padding:6px 0; color:${INK};">${item.quantity}</td>
                    </tr>`
                    )
                    .join("")}
                </table>`
              : `<div style="font-size:14px; color:${INK_MUTED};">استفسار عام (بدون منتج محدد)</div>`
          }
        </td>
      </tr>
    </table>
  </div>
  `;

  return html;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
