import nodemailer from "nodemailer";

export type NewOrderEmailInput = {
  orderId: string;
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

/**
 * Sends a new-order notification automatically to the store inbox
 * (ORDER_NOTIFY_EMAIL, e.g. FAX@SAKKABDOORS.AE). Called right after an
 * order/inquiry is written to the database in app/api/orders/route.ts.
 */
export async function sendNewOrderEmail(order: NewOrderEmailInput) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL ?? process.env.SMTP_USER;
  if (!to) {
    throw new Error("ORDER_NOTIFY_EMAIL is not set in the environment");
  }

  const transport = getTransport();

  const subject = `طلب جديد #${order.orderId.slice(-6).toUpperCase()} — ${order.customerName}`;

  const html = `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; font-size:14px; color:#241e18;">
      <h2 style="color:#875a30;">طلب جديد من موقع سكاب للأبواب</h2>
      <table cellpadding="6" style="border-collapse:collapse;">
        <tr><td><strong>رقم الطلب:</strong></td><td>${order.orderId}</td></tr>
        <tr><td><strong>الاسم:</strong></td><td>${escapeHtml(order.customerName)}</td></tr>
        <tr><td><strong>الهاتف:</strong></td><td>${escapeHtml(order.phone)}</td></tr>
        ${order.email ? `<tr><td><strong>البريد الإلكتروني:</strong></td><td>${escapeHtml(order.email)}</td></tr>` : ""}
        ${order.city ? `<tr><td><strong>المدينة:</strong></td><td>${escapeHtml(order.city)}</td></tr>` : ""}
        ${order.message ? `<tr><td valign="top"><strong>الرسالة:</strong></td><td style="white-space:pre-line;">${escapeHtml(order.message)}</td></tr>` : ""}
      </table>
      ${
        order.items.length
          ? `<h3 style="color:#875a30;">المنتجات المطلوبة</h3>
             <table cellpadding="6" style="border-collapse:collapse;">
               <tr><th align="right">المنتج</th><th align="right">الكمية</th></tr>
               ${order.items
                 .map(
                   (item) =>
                     `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td></tr>`
                 )
                 .join("")}
             </table>`
          : `<p>استفسار عام (بدون منتج محدد).</p>`
      }
    </div>
  `;

  await transport.sendMail({ from, to, subject, html });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
