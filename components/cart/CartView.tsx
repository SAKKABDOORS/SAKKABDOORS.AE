"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useCart } from "./CartProvider";
import OrderForm from "../OrderForm";
import Reveal from "../motion/Reveal";

export default function CartView({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { items, remove, updateQuantity, clear } = useCart();
  // Tracked separately from `items` so the success message stays visible
  // even after `clear()` empties the cart in the same submit — otherwise
  // this view would flash straight to the "cart is empty" state.
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (justSubmitted) {
    return (
      <div className="container-page py-16 text-center">
        <div className="card mx-auto max-w-md border-emerald-200 bg-emerald-50 p-8 text-emerald-800">
          {dict.order_form.success}
        </div>
        <Link href={`/${locale}/products`} className="btn-primary mt-6 inline-flex">
          {dict.cart.browse_catalog}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-200 text-ink-800/40">
          <ShoppingCart className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">{dict.cart.title}</h1>
        <p className="mt-3 text-ink-800/70">{dict.cart.empty}</p>
        <Link href={`/${locale}/products`} className="btn-primary mt-6 inline-flex">
          {dict.cart.browse_catalog}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? "AED";

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-ink-900">{dict.cart.title}</h1>
      <p className="mt-1 text-sm text-ink-800/70">{dict.cart.subtitle}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {items.map((item, i) => (
            <Reveal key={item.productId} delay={Math.min(i * 0.05, 0.25)}>
              <div className="card flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                  <Image src={item.image ?? "/images/placeholder-door.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-ink-900">{item.name}</div>
                  <div className="text-sm text-ink-800/60">
                    {item.price.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE")} {item.currency}
                  </div>
                </div>
                <div>
                  <label htmlFor={`qty-${item.productId}`} className="sr-only">
                    {dict.product.quantity}
                  </label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                    className="input w-20 text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.productId)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  <span className="hidden sm:inline">{dict.cart.remove}</span>
                </button>
              </div>
            </Reveal>
          ))}

          <div className="card flex items-center justify-between p-4">
            <span className="font-semibold text-ink-900">{dict.cart.estimated_total}</span>
            <span className="text-lg font-bold text-brand-700">
              {subtotal.toLocaleString(locale === "ar" ? "ar-AE" : "en-AE")} {currency}
            </span>
          </div>
        </div>

        <OrderForm
          dict={dict}
          cartItems={items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity }))}
          onSuccess={() => {
            setJustSubmitted(true);
            clear();
          }}
        />
      </div>
    </div>
  );
}
