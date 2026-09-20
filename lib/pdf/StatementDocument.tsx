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

export type StatementInvoiceRow = {
  invoiceNumber: number;
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatusValue;
};

export type StatementPdfData = {
  customerName: string;
  customerPhone: string;
  generatedDate: string;
  currency: string;
  invoices: StatementInvoiceRow[];
  companyEmail: string;
  companyBranches: { name: string; phone: string }[];
};

// Same visual language as lib/pdf/InvoiceDocument.tsx — a full-history
// table of this customer's invoices instead of one invoice's line items,
// plus a totals block (invoiced / paid / outstanding) at the bottom.
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
  statementTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.brand700, textAlign: "right" },
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
  colNum: { flex: 1, textAlign: "center" },
  colDate: { flex: 1.3, textAlign: "center" },
  headerCellText: { color: COLORS.brand700, fontSize: 9, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9, color: COLORS.ink900 },
  totalsBlock: { alignItems: "flex-end", marginTop: 8, marginBottom: 22 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 3 },
  totalsLabel: { fontSize: 9.5, color: COLORS.brand700 },
  totalsValue: { fontSize: 9.5, color: COLORS.ink900 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.brand700 },
  grandTotalLabel: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
  grandTotalValue: { fontSize: 12, fontWeight: "bold", color: COLORS.brand700 },
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

export function StatementDocument({ statement }: { statement: StatementPdfData }) {
  const branch = statement.companyBranches[0];
  const totalInvoiced = statement.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = statement.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = Math.round((totalInvoiced - totalPaid) * 100) / 100;

  return (
    <Document title={`SAKKAB — كشف حساب ${statement.customerName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandMark}>
              <Image src={LOGO_SRC} style={styles.logo} />
              <Text style={styles.brandName}>SAKKAB DOORS</Text>
            </View>
            <Text style={styles.statementTitle}>{ar("كشف حساب")}</Text>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldsCol}>
              {branch && <FieldLine label="الفرع" value={branch.name} />}
              <FieldLine label="الهاتف" value={branch ? branch.phone : ""} />
              <FieldLine label="العنوان" value={statement.companyEmail} />
            </View>
            <View style={styles.fieldsCol}>
              <FieldLine label="العميل" value={statement.customerName} />
              <FieldLine label="تاريخ الإصدار" value={statement.generatedDate} />
              <FieldLine label="هاتف العميل" value={statement.customerPhone} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("الحالة")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("المتبقي")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("المدفوع")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("الإجمالي")}</Text>
              <Text style={[styles.colDate, styles.headerCellText]}>{ar("التاريخ")}</Text>
              <Text style={[styles.colNum, styles.headerCellText]}>{ar("رقم الفاتورة")}</Text>
            </View>
            {statement.invoices.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[{ flex: 1, textAlign: "center" }, styles.cellText]}>{ar("لا يوجد فواتير لهذا العميل")}</Text>
              </View>
            ) : (
              statement.invoices.map((inv) => {
                const remaining = Math.round((inv.totalAmount - inv.paidAmount) * 100) / 100;
                return (
                  <View key={inv.invoiceNumber} style={styles.tableRow} wrap={false}>
                    <Text style={[styles.colNum, styles.cellText]}>{ar(INVOICE_STATUS_LABELS[inv.status])}</Text>
                    <Text style={[styles.colNum, styles.cellText]}>{remaining.toFixed(2)}</Text>
                    <Text style={[styles.colNum, styles.cellText]}>{inv.paidAmount.toFixed(2)}</Text>
                    <Text style={[styles.colNum, styles.cellText]}>{inv.totalAmount.toFixed(2)}</Text>
                    <Text style={[styles.colDate, styles.cellText]}>{inv.date}</Text>
                    <Text style={[styles.colNum, styles.cellText]}>#{formatInvoiceNumber(inv.invoiceNumber)}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{totalInvoiced.toFixed(2)} {statement.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("إجمالي الفواتير")}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsValue}>{totalPaid.toFixed(2)} {statement.currency}</Text>
              <Text style={styles.totalsLabel}>{ar("إجمالي المدفوع")}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalValue}>{totalOutstanding.toFixed(2)} {statement.currency}</Text>
              <Text style={styles.grandTotalLabel}>{ar("الرصيد المتبقي")}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

export function renderStatementPdf(statement: StatementPdfData) {
  return renderToBuffer(<StatementDocument statement={statement} />);
}
