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
  brand50: "#f2f5f0",
  sand: "#e4dcc6",
  ink900: "#1b1b18",
  ink800: "#2b2a24",
  white: "#ffffff"
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

const styles = StyleSheet.create({
  page: { paddingTop: 32, paddingBottom: 50, paddingHorizontal: 32, fontFamily: "Amiri", fontSize: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 30, height: 30, borderRadius: 4 },
  brandName: { fontSize: 14, fontWeight: "bold", color: COLORS.ink900 },
  quoteTitleBlock: { alignItems: "flex-end" },
  quoteTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.brand700 },
  quoteMeta: { fontSize: 9, color: COLORS.ink800, marginTop: 2, textAlign: "right" },
  section: { marginBottom: 14, padding: 10, backgroundColor: COLORS.brand50, borderRadius: 6 },
  sectionTitle: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginBottom: 4, textAlign: "right" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  fieldLine: { fontSize: 9.5, color: COLORS.ink800, textAlign: "right", marginTop: 2 },
  table: { marginBottom: 12 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.brand700, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.sand, paddingVertical: 5, paddingHorizontal: 4 },
  colDesc: { flex: 3, textAlign: "right" },
  colNum: { flex: 1, textAlign: "center" },
  headerCellText: { color: COLORS.white, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9, color: COLORS.ink900 },
  totalsBlock: { alignItems: "flex-end", marginBottom: 16 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 3 },
  totalsLabel: { fontSize: 9.5, color: COLORS.ink800 },
  totalsValue: { fontSize: 9.5, color: COLORS.ink900 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.brand700 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  termsBlock: { marginBottom: 14 },
  termsTitle: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginBottom: 4, textAlign: "right" },
  termsText: { fontSize: 8.5, color: COLORS.ink800, textAlign: "right", lineHeight: 1.5, marginBottom: 8 },
  signatureBox: { marginTop: 20, width: 200, height: 60, borderWidth: 1, borderColor: COLORS.ink800, borderRadius: 4, alignItems: "center", justifyContent: "flex-end", padding: 6 },
  signatureLabel: { fontSize: 9, color: COLORS.ink800 },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, textAlign: "center", fontSize: 8, color: COLORS.ink800 }
});

export function QuoteDocument({ quote }: { quote: QuotePdfData }) {
  const number = formatQuoteNumber(quote.quoteNumber);

  return (
    <Document title={`SAKKAB — عرض سعر ${number}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow}>
          <View style={styles.quoteTitleBlock}>
            <Text style={styles.quoteTitle}>عرض سعر</Text>
            <Text style={styles.quoteMeta}>رقم العرض: {number}</Text>
            <Text style={styles.quoteMeta}>التاريخ: {quote.issueDate}</Text>
            {quote.expiryDate && <Text style={styles.quoteMeta}>صالح حتى: {quote.expiryDate}</Text>}
          </View>
          <View style={styles.brandMark}>
            <Text style={styles.brandName}>SAKKAB DOORS</Text>
            <Image src={LOGO_SRC} style={styles.logo} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: 6 }]}>
            <Text style={styles.sectionTitle}>بيانات الزبون</Text>
            <Text style={styles.fieldLine}>{quote.customerName}</Text>
            <Text style={styles.fieldLine}>{quote.customerPhone}</Text>
            {quote.customerEmail && <Text style={styles.fieldLine}>{quote.customerEmail}</Text>}
            {quote.customerAddress && <Text style={styles.fieldLine}>{quote.customerAddress}</Text>}
            {quote.addressedTo && <Text style={styles.fieldLine}>موجّه إلى: {quote.addressedTo}</Text>}
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>شركة سكاب للأبواب</Text>
            <Text style={styles.fieldLine}>{quote.companyEmail}</Text>
            {quote.companyBranches.map((b, i) => (
              <Text key={i} style={styles.fieldLine}>{b.name}: {b.phone}</Text>
            ))}
            {(quote.responsibleName || quote.responsiblePhone) && (
              <Text style={styles.fieldLine}>
                المسؤول: {quote.responsibleName} {quote.responsiblePhone ? `- ${quote.responsiblePhone}` : ""}
              </Text>
            )}
          </View>
        </View>

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

        {/* Known limitation, confirmed harmless: react-pdf/fontkit's font
            subsetting corrupts the invisible ToUnicode (copy/search) text
            layer once a document uses enough unique Amiri glyphs — verified
            with an isolated test that the actual rendered/printed glyphs
            stay correct throughout, only "select text" / PDF search on the
            later terms is affected. No known fix short of patching the
            library; not worth blocking on for a document meant to be read
            and signed rather than copy-pasted from. */}
        <View style={styles.termsBlock}>
          <Text style={styles.termsTitle}>شروط العرض</Text>
          <Text style={styles.termsText}>{quote.termsAr}</Text>
          <Text style={styles.termsText}>{quote.termsEn}</Text>
        </View>

        {quote.customerNote && (
          <View style={styles.termsBlock}>
            <Text style={styles.termsTitle}>ملاحظة للعميل</Text>
            <Text style={styles.termsText}>{quote.customerNote}</Text>
          </View>
        )}

        <View style={{ alignItems: "flex-end" }}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>توقيع العميل</Text>
          </View>
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
