import React from "react";
import path from "path";
import { readFileSync } from "fs";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerCatalogFonts } from "./fonts";
import { formatQuoteNumber } from "@/lib/quotes";

registerCatalogFonts();

// Passed as a Buffer rather than a raw path string — see CatalogDocument.tsx
// for why (react-pdf misparses a Windows absolute path as a URL scheme).
const LOGO_SRC = { data: readFileSync(path.join(process.cwd(), "public", "images", "logo-mark.png")), format: "png" as const };

const COLORS = {
  brand700: "#365030",
  brand600: "#47663b",
  brand50: "#eef2ee",
  sand: "#e4dcc6",
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
// pale-green header block with the logo/title top and two label:value
// columns underneath, a bordered items table, a signature box paired with
// the "توقيع العميل" label, and "ملاحظات العميل" at the bottom — same visual
// language, just typed/computed instead of hand-filled.
const styles = StyleSheet.create({
  page: { paddingTop: 0, paddingBottom: 40, paddingHorizontal: 0, fontFamily: "Amiri", fontSize: 10 },
  headerBlock: { backgroundColor: COLORS.brand50, paddingHorizontal: 32, paddingTop: 28, paddingBottom: 20 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 34, height: 34, borderRadius: 6 },
  brandName: { fontSize: 16, fontWeight: "bold", color: COLORS.ink900 },
  quoteTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.ink900, textAlign: "right" },
  fieldsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  fieldsCol: { flexDirection: "column" },
  fieldLine: { flexDirection: "row", fontSize: 10, color: COLORS.ink900, marginTop: 6 },
  fieldLabel: { fontWeight: "bold", marginLeft: 4 },
  fieldColon: { marginHorizontal: 3 },
  body: { paddingHorizontal: 32, paddingTop: 24 },
  table: { marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 2 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.brand700, paddingVertical: 6, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 7, paddingHorizontal: 4 },
  colDesc: { flex: 3, textAlign: "right", paddingRight: 4 },
  colNum: { flex: 1, textAlign: "center" },
  headerCellText: { color: COLORS.white, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9, color: COLORS.ink900 },
  totalsBlock: { alignItems: "flex-end", marginBottom: 22 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 3 },
  totalsLabel: { fontSize: 9.5, color: COLORS.ink800 },
  totalsValue: { fontSize: 9.5, color: COLORS.ink900 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.brand700 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  signRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 30, gap: 12 },
  signBoxes: { flexDirection: "column", gap: 4 },
  signBox: { width: 160, height: 22, borderWidth: 1, borderColor: COLORS.ink800 },
  signLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.ink900 },
  noteBlock: { marginTop: 30 },
  noteLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.ink900, marginBottom: 4, textAlign: "right" },
  noteText: { fontSize: 9.5, color: COLORS.ink800, textAlign: "right" },
  termsPage: { paddingTop: 32, paddingBottom: 40, paddingHorizontal: 32, fontFamily: "Amiri", fontSize: 10 },
  termsPageTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.brand700, textAlign: "right", marginBottom: 16 },
  termsBlock: { marginBottom: 16 },
  termsSubtitle: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginBottom: 6, textAlign: "right" },
  termsText: { fontSize: 8.5, color: COLORS.ink800, textAlign: "right", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, textAlign: "center", fontSize: 8, color: COLORS.ink800 }
});

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldLine}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldColon}>:</Text>
      <Text>{value}</Text>
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
            <Text style={styles.quoteTitle}>عرض سعر : {number}</Text>
            <View style={styles.brandMark}>
              <Text style={styles.brandName}>SAKKAB DOORS</Text>
              <Image src={LOGO_SRC} style={styles.logo} />
            </View>
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
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colDesc, styles.headerCellText]}>الوصف / المنتج</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>الكمية</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>السعر</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>الضريبة</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>خصم</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>المجموع</Text>
            </View>
            {quote.items.map((item, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.colDesc, styles.cellText]}>{item.descriptionAr}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.quantity}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={[styles.colNum, styles.cellText]}>لا يوجد</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.lineTotal.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{quote.subtotal.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>المجموع الجزئي</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{quote.shippingFee.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>رسوم الشحن</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>-{quote.discountAmount.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.totalsLabel}>خصم إضافي</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalValue}>{quote.grandTotal.toFixed(2)} {quote.currency}</Text>
              <Text style={styles.grandTotalLabel}>الإجمالي</Text>
            </View>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signBoxes}>
              <View style={styles.signBox} />
              <View style={styles.signBox} />
            </View>
            <Text style={styles.signLabel}>توقيع العميل</Text>
          </View>

          {quote.customerNote && (
            <View style={styles.noteBlock}>
              <Text style={styles.noteLabel}>ملاحظات العميل</Text>
              <Text style={styles.noteText}>{quote.customerNote}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Terms get their own dedicated page rather than flowing after the
          quote — the client asked for the two kept visually separate. */}
      <Page size="A4" style={styles.termsPage}>
        <Text style={styles.termsPageTitle}>شروط العرض</Text>
        <View style={styles.termsBlock}>
          <Text style={styles.termsSubtitle}>بالعربي</Text>
          <Text style={styles.termsText}>{quote.termsAr}</Text>
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
