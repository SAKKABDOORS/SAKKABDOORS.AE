import React from "react";
import path from "path";
import { readFileSync } from "fs";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerCatalogFonts } from "./fonts";

registerCatalogFonts();

// Passed as a Buffer rather than a raw path string — react-pdf's Image src
// resolver tries to parse local-path strings as a URL first, and a Windows
// absolute path (C:\...) parses as if "C:" were a URL scheme, so the image
// silently fails to load on Windows.
const LOGO_SRC = { data: readFileSync(path.join(process.cwd(), "public", "images", "logo-mark.png")), format: "png" as const };

const COLORS = {
  brand700: "#365030",
  brand600: "#47663b",
  brand50: "#f2f5f0",
  sand: "#e4dcc6",
  ink900: "#1b1b18",
  ink800: "#2b2a24",
  white: "#ffffff"
};

const MATERIAL_LABELS_AR: Record<string, string> = {
  WPC: "WPC",
  UPVC: "COMPOSITE",
  ALUMINUM: "ألمنيوم",
  STEEL: "حديد"
};

export type CatalogPdfProduct = {
  nameAr: string;
  nameEn: string;
  price: number;
  currency: string;
  material: string;
  inStock: boolean;
  imageUrl: string | null;
};

export type CatalogPdfCategory = {
  nameAr: string;
  nameEn: string;
  products: CatalogPdfProduct[];
};

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 50, paddingHorizontal: 36, fontFamily: "Amiri" },
  coverPage: {
    backgroundColor: COLORS.brand700,
    color: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Amiri"
  },
  coverTitle: { fontSize: 42, fontWeight: "bold", marginBottom: 12 },
  coverSubtitle: { fontSize: 16, textAlign: "center", marginHorizontal: 60, lineHeight: 1.6 },
  // --- Per-product pages: sand background + small corner brand mark,
  // matching the client's reference "collection" back-cover page — 2 large
  // product slots per page instead of a dense grid.
  productPage: { backgroundColor: COLORS.sand },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  logo: { width: 26, height: 26, borderRadius: 4 },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandName: { fontSize: 13, fontWeight: "bold", color: COLORS.ink900 },
  collectionTag: { fontSize: 8, color: COLORS.ink800, letterSpacing: 0.5 },
  categoryTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.brand700, textAlign: "right", marginBottom: 16 },
  productSlot: { flex: 1, marginBottom: 18 },
  // backgroundColor fills in behind transparent PNGs (product cutouts) so
  // they render on white instead of the page's sand background showing
  // through — a no-op for the more common opaque/full-bleed photos.
  productImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.white
  },
  productImagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.brand50,
    alignItems: "center",
    justifyContent: "center"
  },
  productInfoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  productNameAr: { fontSize: 14, fontWeight: "bold", color: COLORS.ink900, textAlign: "right" },
  productNameEn: { fontSize: 10, color: COLORS.ink800, textAlign: "right", marginTop: 2 },
  productMeta: { fontSize: 9, color: COLORS.ink800, textAlign: "right", marginTop: 4 },
  productPrice: { fontSize: 15, fontWeight: "bold", color: COLORS.brand700 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8,
    color: COLORS.ink800
  }
});

function BrandRow({ collectionTag }: { collectionTag: string }) {
  return (
    <View style={styles.brandRow}>
      <Text style={styles.collectionTag}>{collectionTag}</Text>
      <View style={styles.brandMark}>
        <Text style={styles.brandName}>SAKKAB</Text>
        <Image src={LOGO_SRC} style={styles.logo} />
      </View>
    </View>
  );
}

function ProductSlot({ product }: { product: CatalogPdfProduct }) {
  return (
    <View style={styles.productSlot} wrap={false}>
      {product.imageUrl ? (
        <Image src={product.imageUrl} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={{ fontSize: 9, color: COLORS.ink800 }}>لا توجد صورة</Text>
        </View>
      )}
      <View style={styles.productInfoRow}>
        <View>
          <Text style={styles.productNameAr}>{product.nameAr}</Text>
          <Text style={styles.productNameEn}>{product.nameEn}</Text>
          <Text style={styles.productMeta}>
            {MATERIAL_LABELS_AR[product.material] ?? product.material} ·{" "}
            {product.inStock ? "متوفر" : "غير متوفر"}
          </Text>
        </View>
        <Text style={styles.productPrice}>
          {product.price.toLocaleString("en-US")} {product.currency}
        </Text>
      </View>
    </View>
  );
}

// Products are grouped 2-per-page (matching the client's reference
// template) rather than in a dense grid — a category with more than 2
// products simply continues onto additional pages.
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function CatalogDocument({
  categories,
  siteName = "SAKKAB",
  siteTagline = "رواد التطوير العقاري والحلول المبتكرة في الإمارات وسوريا",
  collectionTag = "( COLLECTION 2026 ) @SAKKABDOORS"
}: {
  categories: CatalogPdfCategory[];
  siteName?: string;
  siteTagline?: string;
  collectionTag?: string;
}) {
  return (
    <Document title={`${siteName} — Catalog`}>
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverTitle}>{siteName}</Text>
        <Text style={styles.coverSubtitle}>{siteTagline}</Text>
      </Page>

      {categories.map((category) =>
        chunk(category.products, 2).map((pair, pageIndex) => (
          <Page key={`${category.nameEn}-${pageIndex}`} size="A4" style={[styles.page, styles.productPage]} wrap>
            <BrandRow collectionTag={collectionTag} />
            <Text style={styles.categoryTitle}>
              {category.nameAr} / {category.nameEn}
            </Text>

            {pair.map((product) => (
              <ProductSlot key={`${product.nameEn}-${product.price}`} product={product} />
            ))}

            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
              fixed
            />
          </Page>
        ))
      )}
    </Document>
  );
}

// Kept in this .tsx file so the JSX call site never needs to leak into a
// plain .ts route handler (Next.js route handlers must be `route.ts`).
export function renderCatalogPdf(props: {
  categories: CatalogPdfCategory[];
  siteName?: string;
  siteTagline?: string;
}) {
  return renderToBuffer(<CatalogDocument {...props} />);
}
