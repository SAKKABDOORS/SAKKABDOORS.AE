import React from "react";
import path from "path";
import { readFileSync } from "fs";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { registerCatalogFonts, fixArabicShaping } from "./fonts";

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

export type VoucherPdfData = {
  employeeName: string;
  amount: number;
  reason: string;
  date: string;
  currency: string;
};

// Same visual language as QuoteDocument/InvoiceDocument, much simpler
// content — a one-page سند قبض receipt: who received how much, why, and a
// signature line.
const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingHorizontal: 40, fontFamily: "Amiri", fontSize: 11, backgroundColor: COLORS.white },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1.5, borderBottomColor: COLORS.brand700, paddingBottom: 16 },
  brandMark: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 30, height: 30, borderRadius: 6 },
  brandName: { fontSize: 14, fontWeight: "bold", color: COLORS.brand700 },
  title: { fontSize: 18, fontWeight: "bold", color: COLORS.brand700 },
  fieldLine: { flexDirection: "row", fontSize: 12, color: COLORS.ink900, marginTop: 16 },
  fieldLabel: { fontWeight: "bold", marginLeft: 6, color: COLORS.brand700 },
  fieldColon: { marginHorizontal: 4 },
  amountBox: { marginTop: 24, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, alignItems: "center" },
  amountValue: { fontSize: 22, fontWeight: "bold", color: COLORS.brand700 },
  amountLabel: { fontSize: 10, color: COLORS.ink800, marginTop: 2 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 60 },
  signCol: { alignItems: "center", width: 180 },
  signLine: { borderTopWidth: 1, borderTopColor: COLORS.ink800, width: "100%", marginTop: 30 },
  signLabel: { fontSize: 10, fontWeight: "bold", color: COLORS.brand700, marginTop: 4 }
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

export function VoucherDocument({ voucher }: { voucher: VoucherPdfData }) {
  return (
    <Document title={`SAKKAB — سند قبض`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandMark}>
            <Image src={LOGO_SRC} style={styles.logo} />
            <Text style={styles.brandName}>SAKKAB DOORS</Text>
          </View>
          <Text style={styles.title}>{ar("سند قبض")}</Text>
        </View>

        <FieldLine label="التاريخ" value={voucher.date} />
        <FieldLine label="اسم الموظف" value={voucher.employeeName} />
        <FieldLine label="السبب" value={voucher.reason} />

        <View style={styles.amountBox}>
          <Text style={styles.amountValue}>{voucher.amount.toFixed(2)} {voucher.currency}</Text>
          <Text style={styles.amountLabel}>{ar("المبلغ المستلم")}</Text>
        </View>

        <View style={styles.signRow}>
          <View style={styles.signCol}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>{ar("توقيع الموظف")}</Text>
          </View>
          <View style={styles.signCol}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>{ar("توقيع المسؤول")}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export function renderVoucherPdf(voucher: VoucherPdfData) {
  return renderToBuffer(<VoucherDocument voucher={voucher} />);
}
