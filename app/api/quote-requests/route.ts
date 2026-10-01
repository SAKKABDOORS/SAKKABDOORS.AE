import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const quoteRequestSchema = z.object({
  productName: z.string().min(1).max(200),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  city: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(999),
  measurement: z.string().max(120).optional(),
  details: z.string().max(2000).optional()
});

function buildMessage(data: z.infer<typeof quoteRequestSchema>): string {
  const lines = [`المنتج: ${data.productName}`, `الكمية: ${data.quantity}`];
  if (data.measurement) lines.push(`القياس: ${data.measurement}`);
  if (data.details) lines.push("", data.details);
  return lines.join("\n");
}

// External-facing endpoint (e.g. a partner site or the SAKKAB mobile app's
// own "اطلب عرض سعر" flow) — not the website's own "أرسل طلبك" form, which
// still posts to /api/orders with a real productId from the catalog. This
// one only gets a free-text product NAME from the caller, so it's folded
// into the Order's message field rather than fuzzy-matched against the
// catalog (a wrong match would misattribute the request) — it still lands
// in the exact same place, /admin/orders, for staff to review and action.
// Protected by a static API key rather than requireAdmin()/requireSystemUser()
// since the caller has no SystemUser/Admin login of its own.
export async function POST(request: NextRequest) {
  const expectedKey = process.env.QUOTE_REQUESTS_API_KEY;
  if (!expectedKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = quoteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const order = await prisma.order.create({
    data: {
      customerName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      city: data.city,
      message: buildMessage(data)
    }
  });

  // Best-effort, same as /api/orders — a notification failure must never
  // fail the caller's request; the order is always safely stored.
  try {
    await sendWhatsAppMessage(
      [`طلب عرض سعر جديد #${order.id.slice(-6).toUpperCase()}`, "", `الاسم: ${data.fullName}`, `الهاتف: ${data.phone}`, `المدينة: ${data.city}`, "", buildMessage(data)].join(
        "\n"
      )
    );
    await prisma.order.update({ where: { id: order.id }, data: { emailedOk: true } });
  } catch (err) {
    console.error("Failed to send quote-request WhatsApp notification:", err);
  }

  return NextResponse.json({ id: order.id }, { status: 201 });
}
