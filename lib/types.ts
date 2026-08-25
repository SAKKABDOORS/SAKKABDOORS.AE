import type { Category, Job, Material, Product, ProductImage, Property, PropertyImage } from "@prisma/client";

export type ProductWithRelations = Product & {
  images: ProductImage[];
  category: Category;
};

export type PropertyWithRelations = Property & {
  images: PropertyImage[];
};

export type { Category, Job, Material, Product, ProductImage, Property, PropertyImage };
