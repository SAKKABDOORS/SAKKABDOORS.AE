import nodemailer from "nodemailer";

export type NewOrderEmailInput = {
  orderId: string;
  createdAt: Date;
  customerName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  message?: string | null;
  items: { name: string; quantity: number; measurement?: string | null }[];
};

export type NewJobApplicationEmailInput = {
  applicationId: string;
  createdAt: Date;
  jobTitle: string;
  applicantName: string;
  phone: string;
  yearsExperience: string;
  reasonJoining: string;
  previousWorkplaces?: string | null;
  certificates?: string | null;
  extraMessage?: string | null;
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
    // stuck on "submitting" for minutes on every inquiry. The order/application
    // is already saved before this runs, so failing fast here just makes
    // that wait bounded instead of silent.
    connectionTimeout: 8000,
    socketTimeout: 8000
  });
}

const BRAND = "#2b503a";
const BRAND_LIGHT = "#d6e0d5";
const INK = "#1b1b18";
const INK_MUTED = "#5b5850";
const LOGO_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakkabdoors.ae"}/images/logo-mark.png`;

// Shared shell (header with logo/title/id + a label:value fields table) for
// every auto-sent notification email — order and job-application alike are
// styled to match the admin panel's own print views, built with tables +
// inline styles since email clients don't run Tailwind or support
// flexbox/grid reliably. `bodyHtml` is whatever comes after the fields table
// (items table for orders, nothing extra for job applications).
function buildEmailShell(opts: { title: string; shortId: string; rows: [string, string][]; bodyHtml: string }) {
  return `
  <div dir="rtl" style="background:#f5f3ee; padding:24px 12px; font-family:Tahoma, Arial, sans-serif;">
    <table role="presentation" width="100%" style="max-width:600px; margin:0 auto; background:#ffffff; border-collapse:collapse;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:24px 28px; border-bottom:2px solid ${BRAND};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:18px; font-weight:bold; color:${BRAND};">
                ${opts.title}
                <div style="font-size:12px; font-weight:normal; color:${INK_MUTED}; margin-top:2px;">#${opts.shortId}</div>
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
            ${opts.rows
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
      ${opts.bodyHtml}
    </table>
  </div>
  `;
}

/**
 * Sends a new-order notification automatically to the store inbox
 * (ORDER_NOTIFY_EMAIL — currently a Brother "print by email" address, so
 * this HTML doubles as the order's printed copy). Called right after an
 * order/inquiry is written to the database in app/api/orders/route.ts.
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

  const rows: [string, string][] = [
    ["التاريخ", order.createdAt.toLocaleString("ar-AE")],
    ["اسم العميل", order.customerName],
    ["الهاتف", order.phone],
    ...(order.email ? ([["الإيميل", order.email]] as [string, string][]) : []),
    ...(order.city ? ([["المدينة", order.city]] as [string, string][]) : [])
  ];

  const bodyHtml = `
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
                    <th align="right" style="padding:6px 0; color:${BRAND};">القياس</th>
                    <th align="right" style="padding:6px 0; color:${BRAND};">الكمية</th>
                  </tr>
                  ${order.items
                    .map(
                      (item, i) => `
                    <tr style="${i > 0 ? `border-top:1px solid ${BRAND_LIGHT};` : ""}">
                      <td style="padding:6px 0; color:${INK};">${escapeHtml(item.name)}</td>
                      <td style="padding:6px 0; color:${INK};">${item.measurement ? escapeHtml(item.measurement) : "—"}</td>
                      <td style="padding:6px 0; color:${INK};">${item.quantity}</td>
                    </tr>`
                    )
                    .join("")}
                </table>`
              : `<div style="font-size:14px; color:${INK_MUTED};">استفسار عام (بدون منتج محدد)</div>`
          }
        </td>
      </tr>`;

  return buildEmailShell({ title: "طلب جديد", shortId, rows, bodyHtml });
}

/**
 * Sends a new-job-application notification automatically to the store inbox
 * (ORDER_NOTIFY_EMAIL, the same Brother print-by-email address) — kept as
 * its own email (distinct title/fields, no items table) rather than reusing
 * sendNewOrderEmail(), since a candidate applying for a job isn't a product
 * order and used to look confusing crammed into that template. Called from
 * app/api/job-applications/route.ts right after the application is saved.
 */
export async function sendNewJobApplicationEmail(application: NewJobApplicationEmailInput) {
  const to = process.env.ORDER_NOTIFY_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL ?? process.env.SMTP_USER;
  if (!to) {
    throw new Error("ORDER_NOTIFY_EMAIL is not set in the environment");
  }

  const transport = getTransport();
  const shortId = application.applicationId.slice(-6).toUpperCase();
  const subject = `طلب توظيف جديد #${shortId} — ${application.applicantName}`;
  const html = buildNewJobApplicationEmailHtml(application);

  await transport.sendMail({ from, to, subject, html });
}

// Split out from sendNewJobApplicationEmail() so the markup can be
// rendered/previewed without an SMTP connection.
export function buildNewJobApplicationEmailHtml(application: NewJobApplicationEmailInput) {
  const shortId = application.applicationId.slice(-6).toUpperCase();

  const rows: [string, string][] = [
    ["التاريخ", application.createdAt.toLocaleString("ar-AE")],
    ["الوظيفة", application.jobTitle],
    ["الاسم", application.applicantName],
    ["الهاتف", application.phone],
    ["سنوات الخبرة", application.yearsExperience],
    ...(application.previousWorkplaces ? ([["أماكن العمل السابقة", application.previousWorkplaces]] as [string, string][]) : [])
  ];

  const textBlock = (label: string, value: string) => `
      <tr>
        <td style="padding:16px 28px 0;">
          <div style="font-size:14px; font-weight:bold; color:${BRAND}; margin-bottom:4px;">${label}</div>
          <div style="font-size:14px; color:${INK}; white-space:pre-line;">${escapeHtml(value)}</div>
        </td>
      </tr>`;

  const bodyHtml =
    textBlock("سبب الانضمام", application.reasonJoining) +
    (application.certificates ? textBlock("الشهادات", application.certificates) : "") +
    (application.extraMessage ? textBlock("ملاحظات إضافية", application.extraMessage) : "") +
    `<tr><td style="padding:0 0 20px;"></td></tr>`;

  return buildEmailShell({ title: "طلب توظيف جديد", shortId, rows, bodyHtml });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
