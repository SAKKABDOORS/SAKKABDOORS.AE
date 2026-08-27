import type { Category, Job, Material, Product, ProductImage, Property, PropertyImage } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  category: Category;
};

export type PropertyWithRelations = Property & {
  images: PropertyImage[];
};

// A product's images array can now include videos (see ProductImage.type)
// — anywhere a single still image is needed (card thumbnails, cart lines,
// og:image), this picks the first real photo instead of assuming
// position 0 is always one.
export function firstProductImageUrl(images: { url: string; type: string }[]): string | undefined {
  return images.find((img) => img.type !== "VIDEO")?.url;
}

export type { Category, Job, Material, Product, ProductImage, Property, PropertyImage };
