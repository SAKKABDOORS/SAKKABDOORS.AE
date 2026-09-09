import React from "react";
import path from "path";
import { readFileSync } from "fs";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerCatalogFonts, fixArabicShaping } from "./fonts";
import { formatQuoteNumber } from "@/lib/quotes";

registerCatalogFonts();

const ar = fixArabicShaping;

// Passed as a Buffer rather than a raw path string — see CatalogDocument.tsx
// for why (react-pdf misparses a Windows absolute path as a URL scheme).
const LOGO_SRC = { data: readFileSync(path.join(process.cwd(), "public", "images", "logo-mark.png")), format: "png" as const };

const COLORS = {
  brand700: "#365030",
  brand600: "#47663b",
  ink900: "#1b1b18",
  ink800: "#2b2a24",
  white: "#ffffff",
  border: "#c7d2c5"
};

export type QuotePdfItem = {
  descriptionAr: string;
  descriptionEn: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
};

export type QuotePdfData = {
  quoteNumber: number;
  issueDate: string;
  expiryDate: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  customerNumber: string | null;
  addressedTo: string | null;
  responsibleName: string | null;
  responsiblePhone: string | null;
  items: QuotePdfItem[];
  shippingFee: number;
  discountAmount: number;
  subtotal: number;
  grandTotal: number;
  currency: string;
  termsAr: string;
  termsEn: string;
  customerNote: string | null;
  companyEmail: string;
  companyBranches: { name: string; phone: string }[];
};

// Layout modeled directly on the client's real paper invoice template: a
// white page throughout (the template's own header block is a very pale,
// near-white tint — reproduced here as plain white per the client's own
// request), brand-green used for headings/labels/accents instead of a
// filled block, a bordered items table, a signature box paired with the
// "توقيع العميل" label, and "ملاحظات العميل" at the bottom.
const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 40, paddingHorizontal: 0, fontFamily: "Amiri", fontSize: 10, backgroundColor: COLORS.white },
  headerBlock: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.brand700
  },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 34, height: 34, borderRadius: 6 },
  brandName: { fontSize: 16, fontWeight: "bold", color: COLORS.brand700 },
  quoteTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.brand700, textAlign: "right" },
  fieldsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  fieldsCol: { flexDirection: "column" },
  fieldLine: { flexDirection: "row", fontSize: 10, color: COLORS.ink900, marginTop: 6 },
  fieldLabel: { fontWeight: "bold", marginLeft: 4, color: COLORS.brand700 },
  fieldColon: { marginHorizontal: 3 },
  body: { paddingHorizontal: 32, paddingTop: 24 },
  table: { marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 2 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.brand700,
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 7, paddingHorizontal: 4 },
  colDesc: { flex: 3, textAlign: "right", paddingLeft: 4 },
  colNum: { flex: 1, textAlign: "center" },
  headerCellText: { color: COLORS.brand700, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9, color: COLORS.ink900 },
  totalsBlock: { alignItems: "flex-end", marginBottom: 22 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 3 },
  totalsLabel: { fontSize: 9.5, color: COLORS.brand700 },
  totalsValue: { fontSize: 9.5, color: COLORS.ink900 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.brand700 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  signRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 30, gap: 12 },
  signBoxes: { flexDirection: "column", gap: 4 },
  signBox: { width: 160, height: 22, borderWidth: 1, borderColor: COLORS.ink800 },
  signLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700 },
  noteBlock: { marginTop: 30 },
  noteLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginBottom: 4, textAlign: "right" },
  noteText: { fontSize: 9.5, color: COLORS.ink800, textAlign: "right" },
  termsPage: { paddingTop: 32, paddingBottom: 40, paddingHorizontal: 32, fontFamily: "Amiri", fontSize: 10, backgroundColor: COLORS.white },
  termsPageTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.brand700, textAlign: "right", marginBottom: 16 },
  termsBlock: { marginBottom: 16 },
  termsSubtitle: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginBottom: 6, textAlign: "right" },
  termsText: { fontSize: 8.5, color: COLORS.ink800, textAlign: "right", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, textAlign: "center", fontSize: 8, color: COLORS.ink800 }
});

// react-pdf's flex layout doesn't auto-flip for RTL the way a browser does
// with <html dir="rtl"> — flexDirection:"row" always places the first JSX
// child on the LEFT. So every row of "separate pieces that should read
// right-to-left" has to be authored in the REVERSE of natural reading
// order: value, then the colon, then the label last (so the label — read
// first in Arabic — ends up on the right).
function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldLine}>
      <Text>{ar(value)}</Text>
      <Text style={styles.fieldColon}>:</Text>
      <Text style={styles.fieldLabel}>{ar(label)}</Text>
    </View>
  );
}

export function QuoteDocument({ quote }: { quote: QuotePdfData }) {
  const number = formatQuoteNumber(quote.quoteNumber);
  const branch = quote.companyBranches[0];

  return (
    <Document title={`SAKKAB — عرض سعر ${number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandMark}>
              <Image src={LOGO_SRC} style={styles.logo} />
              <Text style={styles.brandName}>SAKKAB DOORS</Text>
            </View>
            <Text style={styles.quoteTitle}>{ar(`عرض سعر : ${number}`)}</Text>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldsCol}>
              {branch && <FieldLine label="الفرع" value={branch.name} />}
              <FieldLine label="الهاتف" value={branch ? branch.phone : ""} />
              <FieldLine label="العنوان" value={quote.companyEmail} />
              <FieldLine label="الموقع" value="sakkabdoors.ae" />
              {(quote.responsibleName || quote.responsiblePhone) && (
                <FieldLine
                  label="المسؤول"
                  value={[quote.responsibleName, quote.responsiblePhone].filter(Boolean).join(" - ")}
                />
              )}
            </View>
            <View style={styles.fieldsCol}>
              <FieldLine label="العميل" value={quote.customerName} />
              <FieldLine label="التاريخ" value={quote.issueDate} />
              {quote.customerNumber && <FieldLine label="رقم العميل" value={quote.customerNumber} />}
              <FieldLine label="هاتف العميل" value={quote.customerPhone} />
              {quote.customerAddress && <FieldLine label="عنوان العميل" value={quote.customerAddress} />}
              {quote.addressedTo && <FieldLine label="موجّه إلى" value={quote.addressedTo} />}
              {quote.expiryDate && <FieldLine label="صالح حتى" value={quote.expiryDate} />}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.table}>
            {/* Columns authored right-to-left in JSX (see the FieldLine
                comment above) so "الوصف / المنتج" — the first thing read in
                Arabic — ends up on the right and "المجموع" trails off to
                the left, matching a normal Arabic invoice table. */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("المجموع")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("خصم")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("الضريبة")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("السعر")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("الكمية")}</Text>
              <Text style={[styles.colDesc, styles.headerCellText]}>{ar("الوصف / المنتج")}</Text>
            </View>
            {quote.items.map((item, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.colNum, styles.cellText]}>{item.lineTotal.toFixed(2)}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{ar("لا يوجد")}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.quantity}</Text>
                <Text style={[styles.colDesc, styles.cellText]}>{ar(item.descriptionAr)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{quote.subtotal.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("المجموع الجزئي")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{quote.shippingFee.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("رسوم الشحن")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>-{quote.discountAmount.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("خصم إضافي")}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalValue}>{quote.grandTotal.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.grandTotalLabel}>{ar("الإجمالي")}</Text>
            </View>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signBoxes}>
              <View style={styles.signBox} />
              <View style={styles.signBox} />
            </View>
            <Text style={styles.signLabel}>{ar("توقيع العميل")}</Text>
          </View>

          {quote.customerNote && (
            <View style={styles.noteBlock}>
              <Text style={styles.noteLabel}>{ar("ملاحظات العميل")}</Text>
              <Text style={styles.noteText}>{ar(quote.customerNote)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Terms get their own dedicated page rather than flowing after the
          quote — the client asked for the two kept visually separate. */}
      <Page size="A4" style={styles.termsPage}>
        <Text style={styles.termsPageTitle}>{ar("شروط العرض")}</Text>
        <View style={styles.termsBlock}>
          <Text style={styles.termsSubtitle}>{ar("بالعربي")}</Text>
          <Text style={styles.termsText}>{ar(quote.termsAr)}</Text>
        </View>
        <View style={styles.termsBlock}>
          <Text style={styles.termsSubtitle}>In English</Text>
          <Text style={styles.termsText}>{quote.termsEn}</Text>
        </View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

// Kept in this .tsx file so the JSX call site never needs to leak into a
// plain .ts route handler (Next.js route handlers must be `route.ts`).
export function renderQuotePdf(quote: QuotePdfData) {
  return renderToBuffer(<QuoteDocument quote={quote} />);
}
