"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCartButton({
  product,
  quantity = 1,
  label,
  addedLabel,
  className = "btn-secondary"
}: {
  product: { id: string; slug: string; name: string; image: string | null; price: number; currency: string };
  quantity?: number;
  label: string;
  addedLabel: string;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        currency: product.currency
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {added ? addedLabel : label}
    </button>
  );
}
