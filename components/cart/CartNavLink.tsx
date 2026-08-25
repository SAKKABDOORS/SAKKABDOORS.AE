"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartNavLink({ locale, label }: { locale: string; label: string }) {
  const { count } = useCart();

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative flex items-center gap-1.5 text-sm font-medium text-white/75 transition hover:text-white"
    >
      <ShoppingCart className="h-4 w-4" />
      {label}
      {count > 0 && (
        <span className="absolute -end-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
