import React from "react";
import path from "path";
import { readFileSync } from "fs";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerCatalogFonts, fixArabicShaping } from "./fonts";
import { formatInvoiceNumber, INVOICE_STATUS_LABELS, type InvoiceStatusValue } from "@/lib/invoices";

registerCatalogFonts();

const ar = fixArabicShaping;

const LOGO_SRC = { data: readFileSync(path.join(process.cwd(), "public", "images", "logo-mark.png")), format: "png" as const };

const COLORS = {
  brand700: "#365030",
  ink900: "#1b1b18",
  ink800: "#2b2a24",
  white: "#ffffff",
  border: "#c7d2c5"
};

export type InvoicePdfItem = {
  descriptionAr: string;
  descriptionEn: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
};

export type InvoicePdfData = {
  invoiceNumber: number;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  items: InvoicePdfItem[];
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatusValue;
  currency: string;
  companyEmail: string;
  companyBranches: { name: string; phone: string }[];
};

// Same visual language as lib/pdf/QuoteDocument.tsx (white page, brand-green
// headings, bordered items table, RTL-via-JSX-order — see that file's
// comments for why) but a single page: no terms re-statement (already
// agreed at the quote stage) and a paid/remaining/status block instead of
// a flat total.
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
  invoiceTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.brand700, textAlign: "right" },
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
  statusBlock: { alignItems: "flex-end", marginBottom: 22, marginTop: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3, backgroundColor: COLORS.brand700 },
  statusBadgeText: { fontSize: 10, fontWeight: "bold", color: COLORS.white },
  signRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 30, gap: 12 },
  signBoxes: { flexDirection: "column", gap: 4 },
  signBox: { width: 160, height: 22, borderWidth: 1, borderColor: COLORS.ink800 },
  signLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700 },
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, textAlign: "center", fontSize: 8, color: COLORS.ink800 }
});

function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldLine}>
      <Text>{ar(value)}</Text>
      <Text style={styles.fieldColon}>:</Text>
      <Text style={styles.fieldLabel}>{ar(label)}</Text>
    </View>
  );
}

export function InvoiceDocument({ invoice }: { invoice: InvoicePdfData }) {
  const number = formatInvoiceNumber(invoice.invoiceNumber);
  const branch = invoice.companyBranches[0];
  const remaining = Math.round((invoice.totalAmount - invoice.paidAmount) * 100) / 100;

  return (
    <Document title={`SAKKAB — فاتورة ${number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandMark}>
              <Image src={LOGO_SRC} style={styles.logo} />
              <Text style={styles.brandName}>SAKKAB DOORS</Text>
            </View>
            <Text style={styles.invoiceTitle}>{ar(`فاتورة : ${number}`)}</Text>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldsCol}>
              {branch && <FieldLine label="الفرع" value={branch.name} />}
              <FieldLine label="الهاتف" value={branch ? branch.phone : ""} />
              <FieldLine label="العنوان" value={invoice.companyEmail} />
              <FieldLine label="الموقع" value="sakkabdoors.ae" />
            </View>
            <View style={styles.fieldsCol}>
              <FieldLine label="العميل" value={invoice.customerName} />
              <FieldLine label="التاريخ" value={invoice.issueDate} />
              <FieldLine label="هاتف العميل" value={invoice.customerPhone} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("المجموع")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("خصم")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("السعر")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("الكمية")}</Text>
              <Text style={[styles.colDesc, styles.headerCellText]}>{ar("الوصف / المنتج")}</Text>
            </View>
            {invoice.items.map((item, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.colNum, styles.cellText]}>{item.lineTotal.toFixed(2)}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.unitPrice.toFixed(2)}</Text>
                <Text style={[styles.colNum, styles.cellText]}>{item.quantity}</Text>
                <Text style={[styles.colDesc, styles.cellText]}>{ar(item.descriptionAr)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalValue}>{invoice.totalAmount.toFixed(2)} {invoice.currency}</Text>
              <Text style={styles.grandTotalLabel}>{ar("الإجمالي")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{invoice.paidAmount.toFixed(2)} {invoice.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("المدفوع")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{remaining.toFixed(2)} {invoice.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("المتبقي")}</Text>
            </View>
          </View>

          <View style={styles.statusBlock}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{ar(INVOICE_STATUS_LABELS[invoice.status])}</Text>
            </View>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signBoxes}>
              <View style={styles.signBox} />
              <View style={styles.signBox} />
            </View>
            <Text style={styles.signLabel}>{ar("توقيع العميل")}</Text>
          </View>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

export function renderInvoicePdf(invoice: InvoicePdfData) {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
}
