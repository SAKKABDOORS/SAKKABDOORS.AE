"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

type CartLine = { productId: string; name: string; quantity: number };

export default function OrderForm({
  dict,
  productId,
  productName,
  cartItems,
  initialMessage,
  onSuccess
}: {
  dict: Dictionary;
  productId?: string;
  productName?: string;
  // When set (cart page), the form submits every line at once instead of a
  // single product+quantity pair — quantities are managed upstream by
  // CartView, not by this form.
  cartItems?: CartLine[];
  // Pre-fills the message field — used by the real-estate detail page,
  // which has no productId to attach (Order/OrderItem only relate to
  // Product) so the property being asked about is only captured as text.
  initialMessage?: string;
  onSuccess?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);

    const items = cartItems
      ? cartItems.map((line) => ({ productId: line.productId, quantity: line.quantity }))
      : productId
        ? [{ productId, quantity: Number(data.get("quantity") || 1) }]
        : [];

    const payload = {
      customerName: String(data.get("customerName") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      city: String(data.get("city") || "") || undefined,
      message: String(data.get("message") || "") || undefined,
      items
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      form.reset();
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        {dict.order_form.success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-bold text-ink-900">{dict.order_form.title}</h3>
        <p className="text-sm text-ink-800/70">{dict.order_form.subtitle}</p>
        {productName && (
          <p className="mt-2 text-sm font-medium text-brand-700">{productName}</p>
        )}
        {cartItems && cartItems.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm font-medium text-brand-700">
            {cartItems.map((line) => (
              <li key={line.productId}>
                {line.name} × {line.quantity}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerName">{dict.order_form.name}</label>
          <input className="input" id="customerName" name="customerName" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">{dict.order_form.phone}</label>
          <input className="input" id="phone" name="phone" type="tel" required />
        </div>
        <div>
          <label className="label" htmlFor="email">{dict.order_form.email}</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="city">{dict.order_form.city}</label>
          <input className="input" id="city" name="city" />
        </div>
        {productId && !cartItems && (
          <div>
            <label className="label" htmlFor="quantity">{dict.product.quantity}</label>
            <input className="input" id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="message">{dict.order_form.message}</label>
        <textarea className="input" id="message" name="message" rows={4} defaultValue={initialMessage} />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">{dict.order_form.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || (cartItems !== undefined && cartItems.length === 0)}
        className="btn-primary w-full"
      >
        {status === "submitting" ? dict.order_form.submitting : dict.order_form.submit}
      </button>
    </form>
  );
}
