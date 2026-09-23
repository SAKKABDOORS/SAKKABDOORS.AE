import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage, buildNewOrderWhatsAppText } from "@/lib/whatsapp";

const orderSchema = z.object({
  customerName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  // Optional — the job-application form (CareersView -> JobApplyForm) never
  // collects an email, only phone. z.literal("") covers OrderForm, which
  // still sends "" instead of omitting the key when its own field is empty.
  email: z.union([z.string().email(), z.literal("")]).optional(),
  city: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(999),
        measurement: z.string().max(120).optional()
      })
    )
    .max(50)
    .default([])
});

// Creates an order/inquiry (one product from a detail page, several from the
// cart, or none for a general contact-page inquiry) AND auto-sends it to
// WhatsApp (lib/whatsapp.ts) — instant per-order printing (Brother
// print-by-email to ORDER_NOTIFY_EMAIL) was intentionally removed in favor
// of WhatsApp plus a weekly printed digest (app/api/system/cron/
// weekly-report/route.ts), so paper only comes out once a week now. The DB
// write always happens first so no order is ever lost even if the
// WhatsApp send fails; that failure is reported back on the order record
// (emailedOk — repurposed to mean "WhatsApp notified", not "emailed",
// see /admin/orders) instead of failing the whole request.
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const products = data.items.length
    ? await prisma.product.findMany({ where: { id: { in: data.items.map((i) => i.productId) } } })
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));
  // Silently drop any productId that no longer exists rather than failing
  // the whole submission over one stale cart entry.
  const validItems = data.items.filter((i) => productById.has(i.productId));

  const order = await prisma.order.create({
    data: {
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || undefined,
      city: data.city,
      message: data.message,
      items: {
        create: validItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          measurement: i.measurement || undefined
        }))
      }
    }
  });

  const notifyPayload = {
    orderId: order.id,
    createdAt: order.createdAt,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    city: order.city,
    message: order.message,
    items: validItems.map((i) => {
      const p = productById.get(i.productId)!;
      return { name: `${p.nameAr} / ${p.nameEn}`, quantity: i.quantity, measurement: i.measurement };
    })
  };

  // Best-effort — a WhatsApp delivery failure (or Green API not configured)
  // must never fail the customer-facing request. The order is always
  // safely stored and visible in /admin/orders either way.
  try {
    await sendWhatsAppMessage(buildNewOrderWhatsAppText(notifyPayload));
    await prisma.order.update({ where: { id: order.id }, data: { emailedOk: true } });
  } catch (err) {
    console.error("Failed to send order WhatsApp notification:", err);
  }

  return NextResponse.json({ id: order.id }, { status: 201 });
}
